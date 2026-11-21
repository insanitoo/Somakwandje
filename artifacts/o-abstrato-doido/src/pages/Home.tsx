import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useListObras, useListEventos } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";
import heroPng from "@assets/hero.png";
import artistPng from "@assets/image_1788615145695.png";
import awardPhoto1 from "@assets/4689c67a-5892-46f5-9514-332a6e89fe7c_1788774876319.jpeg";
import awardPhoto2 from "@assets/3cbdadc3-f0bd-482c-b4d0-abe396040710_1788774876320.jpeg";
import awardPhoto3 from "@assets/bd246196-e411-4618-8f6c-757b1b0a2f89_1788774876320.jpeg";
import awardPhoto4 from "@assets/404c4dc0-c9a0-48e4-b7f9-a4a66919070b_1788774876321.jpeg";
import { useLanguage, type Language } from "@/i18n";

function parsePrecoNum(preco: string | null | undefined): number | null {
  if (!preco) return null;
  const num = parseFloat(preco.replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(num) ? null : num;
}

function formatPreco(num: number): string {
  return `${num.toLocaleString("pt-AO")} Kz`;
}

function formatObraPreco(preco: string | null | undefined): string | null {
  const num = parsePrecoNum(preco);
  if (num === null) return preco ?? null;
  return formatPreco(num);
}
const WA = "244952582536";

function buildWA(msg: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

function ObraCard({
  obra,
  featured = false,
}: {
  obra: { id: number; titulo: string; imagemUrl?: string | null; status: string; preco?: string | null };
  featured?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <Link
      href={`/galeria?obra=${obra.id}`}
      data-testid={`card-obra-${obra.id}`}
      className={`group relative block overflow-hidden rounded-[1.75rem] bg-slate-900 ${featured ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <div className={`relative min-h-[16rem] overflow-hidden bg-primary/10 ${featured ? "md:min-h-[31rem]" : "md:min-h-[15rem]"}`}>
        {obra.imagemUrl ? (
          <img
            src={obra.imagemUrl}
            alt={obra.titulo}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
            <span className="px-4 text-center font-serif text-sm text-white">{obra.titulo}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] tracking-[0.16em] uppercase text-slate-700">
            {obra.status === "disponivel" ? t("common.available") : t("common.sold")}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <div>
            <p className="font-serif text-lg leading-tight">{obra.titulo}</p>
            <p className="mt-1 text-xs text-white/70">{formatObraPreco(obra.preco) || t("home.priceOnRequest")}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const { data: todasObras, isLoading: obrasLoading } = useListObras();
  const destaques = todasObras?.filter((o) => o.destaque) ?? [];
  const obras = destaques.length > 0 ? destaques.slice(0, 4) : (todasObras ?? []).slice(0, 4);
  const { data: eventos, isLoading: eventosLoading } = useListEventos();

  const proximoEvento = eventos?.find((e) => e.tipo === "futuro") ?? eventos?.[eventos.length - 1];
  const awardTrackRef = useRef<HTMLDivElement>(null);
  const awardDragStart = useRef<number | null>(null);
  const [awardIndex, setAwardIndex] = useState(0);
  const [awardDragOffset, setAwardDragOffset] = useState(0);
  const [awardSlideDistance, setAwardSlideDistance] = useState(0);
  const awardPhotos = [awardPhoto1, awardPhoto2, awardPhoto3, awardPhoto4];

  useEffect(() => {
    const updateSlideDistance = () => {
      const firstSlide = awardTrackRef.current?.firstElementChild as HTMLElement | null;
      if (firstSlide) setAwardSlideDistance(firstSlide.offsetWidth + 16);
    };
    updateSlideDistance();
    window.addEventListener("resize", updateSlideDistance);
    return () => window.removeEventListener("resize", updateSlideDistance);
  }, []);

  function finishAwardDrag() {
    if (awardDragStart.current === null) return;
    const movedBy = awardDragOffset;
    if (Math.abs(movedBy) > 48) {
      setAwardIndex((current) => Math.max(0, Math.min(awardPhotos.length - 1, current + (movedBy < 0 ? 1 : -1))));
    }
    awardDragStart.current = null;
    setAwardDragOffset(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[32rem] sm:h-[min(110vw,44rem)] md:h-[min(72vh,780px)] md:min-h-[560px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_18%] md:bg-top"
          style={{ backgroundImage: `url(${heroPng})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full translate-y-12 md:translate-y-16 flex flex-col items-center gap-6 text-center text-white">
          <h1 className="max-w-3xl font-serif text-2xl leading-[1.08] md:text-5xl lg:text-6xl drop-shadow-[0_3px_12px_rgba(0,0,0,0.5)]">
            {t("home.heroStatement")}
          </h1>
          <Link
            href="/galeria"
            data-testid="button-ver-galeria"
            className="mt-2 inline-flex min-w-[15rem] items-center justify-center gap-3 rounded-md bg-primary px-10 py-5 text-sm tracking-[0.22em] uppercase text-white shadow-[0_12px_28px_rgba(0,0,0,0.25)] ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 md:min-w-[18rem]"
          >
            {t("home.viewGallery")}
          </Link>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-20 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-12 md:gap-20 items-center">
          <div className="order-1 flex justify-center">
            <img
              src={artistPng}
              alt="Victor Eurico Somakwendje no atelier"
              className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover object-top ring-1 ring-primary/25 shadow-[0_18px_46px_rgba(14,146,200,0.52)]"
              data-testid="img-artist-home"
            />
          </div>
          <div className="order-2 max-w-xl text-center">
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {t("home.aboutTeaser")}
            </p>
            <Link
              href="/sobre"
              data-testid="button-saber-mais"
              className="inline-flex items-center justify-center gap-2 mt-6 text-xs tracking-[0.18em] uppercase text-primary border-b border-primary/60 pb-1 hover:border-primary hover:gap-3 transition-all"
            >
              {t("home.aboutArtist")}
            </Link>
          </div>
        </div>
      </section>

      {/* Award feature */}
      <section className="overflow-hidden bg-background py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-primary">{t("home.awardEyebrow")}</p>
            <h2 className="font-serif text-3xl text-foreground">{t("home.awardTitle")}</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("home.awardDescription")}</p>
          </div>

          <div
            className="overflow-hidden touch-pan-y select-none"
            role="region"
            aria-roledescription="carousel"
            aria-label={t("home.photoGalleryLabel")}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") setAwardIndex((current) => Math.min(awardPhotos.length - 1, current + 1));
              if (event.key === "ArrowLeft") setAwardIndex((current) => Math.max(0, current - 1));
            }}
            onPointerDown={(event) => {
              awardDragStart.current = event.clientX;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (awardDragStart.current !== null) setAwardDragOffset(event.clientX - awardDragStart.current);
            }}
            onPointerUp={finishAwardDrag}
            onPointerCancel={finishAwardDrag}
          >
            <div
              ref={awardTrackRef}
              className="flex w-max items-end gap-4 transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${awardSlideDistance ? -awardIndex * awardSlideDistance + awardDragOffset : 0}px, 0, 0)`,
                transitionDuration: awardDragStart.current === null ? "300ms" : "0ms",
              }}
            >
              {awardPhotos.map((photo, index) => (
                <figure key={photo} className="w-[76vw] max-w-[24rem] shrink-0 md:w-[56vw] md:max-w-[42rem]">
                  <img
                    src={photo}
                    alt={`${t("home.photoGalleryLabel")} — ${index + 1}`}
                    className="h-[22rem] w-full object-contain object-left md:h-[32rem]"
                    draggable={false}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery highlights */}
      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-xs tracking-[0.3em] uppercase text-primary">{t("home.galleryEyebrow")}</p>
              <h2 className="font-serif text-3xl text-foreground md:text-4xl">{t("home.galleryHighlights")}</h2>
            </div>
            <Link
              href="/galeria"
              className="inline-flex shrink-0 items-center gap-2 border-b border-primary/60 pb-1 text-xs tracking-[0.18em] uppercase text-primary transition-colors hover:border-primary"
            >
              {t("home.viewAll")}
            </Link>
          </div>

          {obrasLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`overflow-hidden rounded-[1.75rem] ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <Skeleton className={i === 0 ? "h-[31rem]" : "h-[15rem]"} />
                </div>
              ))}
            </div>
          ) : obras && obras.length > 0 ? (
            <div className="grid grid-cols-2 auto-rows-[15rem] gap-4 md:grid-cols-4">
              {obras.map((obra, index) => (
                <ObraCard key={obra.id} obra={obra} featured={index === 0} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-16 font-serif text-lg">
              {t("home.worksSoon")}
            </p>
          )}

        </div>
      </section>

      {/* Next event banner */}
      <section className="bg-background pb-24 pt-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-xs tracking-[0.3em] uppercase text-primary">{t("home.agenda")}</p>
              <h2 className="font-serif text-3xl text-foreground md:text-4xl">{t("home.featuredEvent")}</h2>
            </div>
          </div>

          {eventosLoading ? (
            <div className="grid overflow-hidden rounded-[2rem] border border-primary/10 bg-white/50 md:grid-cols-[1.1fr_0.9fr]">
              <div className="p-8 md:p-10">
                <Skeleton className="mb-5 h-4 w-28" />
                <Skeleton className="mb-4 h-8 w-3/4" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="min-h-56 rounded-none" />
            </div>
          ) : proximoEvento ? (
            <div className="grid overflow-hidden rounded-[2rem] border border-primary/10 bg-white/60 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:grid-cols-[1.1fr_0.9fr]" data-testid={`card-evento-${proximoEvento.id}`}>
              <div className="flex flex-col justify-between p-7 md:p-10">
                <div>
                  <span className={`mb-5 inline-flex rounded-full px-3 py-1 text-[10px] tracking-[0.18em] uppercase ${proximoEvento.tipo === "futuro" ? "bg-primary text-white" : "bg-slate-200 text-slate-600"}`}>
                    {proximoEvento.tipo === "futuro" ? t("home.nextEvent") : t("home.lastEvent")}
                  </span>
                  <h3 className="max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl">{proximoEvento.nome}</h3>
                  <div className="mt-6 space-y-2">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={15} className="text-primary" /> {proximoEvento.dataEvento}
                    </p>
                    {proximoEvento.local && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={15} className="text-primary" /> {proximoEvento.local}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {proximoEvento.tipo === "futuro" && (
                    <a
                      href={buildWA(
                        ({
                          pt: `Olá, vi no seu site o evento "${proximoEvento.nome}" e gostaria de saber mais.`,
                          en: `Hello, I saw the event "${proximoEvento.nome}" on your website and would like to know more.`,
                          fr: `Bonjour, j’ai vu l’événement « ${proximoEvento.nome} » sur votre site et j’aimerais en savoir plus.`,
                        } satisfies Record<Language, string>)[language],
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`button-interessado-evento-${proximoEvento.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm tracking-widest uppercase text-white transition-colors hover:bg-primary/90"
                    >
                      {t("common.interested")}
                    </a>
                  )}
                  <Link
                    href="/agenda"
                    data-testid="button-ver-agenda"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-sm tracking-widest uppercase text-primary transition-colors hover:bg-primary/5"
                  >
                    {t("home.viewAgenda")}
                  </Link>
                </div>
              </div>
              {proximoEvento.imagemCapaUrl ? (
                <div className="relative min-h-64 overflow-hidden bg-slate-200 md:min-h-full">
                  <img src={proximoEvento.imagemCapaUrl} alt={proximoEvento.nome} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                </div>
              ) : (
                <div className="hidden min-h-64 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent md:block" />
              )}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-serif text-lg text-muted-foreground">{t("home.noEvents")}</p>
              <Link
                href="/agenda"
                className="mt-5 inline-flex shrink-0 items-center border-b border-primary/60 pb-1 text-xs tracking-[0.18em] uppercase text-primary transition-colors hover:border-primary"
              >
                {t("home.fullAgenda")}
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
