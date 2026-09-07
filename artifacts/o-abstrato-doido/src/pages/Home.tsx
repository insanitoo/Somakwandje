import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useListObras, useListEventos } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";
import heroPng from "@assets/image_1788615103140.png";
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

function ObraCard({ obra }: { obra: { id: number; titulo: string; imagemUrl?: string | null; status: string; preco?: string | null } }) {
  const { t } = useLanguage();

  return (
    <Link href={`/galeria?obra=${obra.id}`} data-testid={`card-obra-${obra.id}`} className="group block overflow-hidden bg-card border border-card-border">
      <div className="aspect-square overflow-hidden bg-primary/10 relative">
        {obra.imagemUrl ? (
          <img
            src={obra.imagemUrl}
            alt={obra.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/20">
            <span className="font-serif text-primary text-sm px-4 text-center">{obra.titulo}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2 py-0.5 ${obra.status === "disponivel" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
            {obra.status === "disponivel" ? t("common.available") : t("common.sold")}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="font-serif text-base text-foreground">{obra.titulo}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatObraPreco(obra.preco) || t("home.priceOnRequest")}</p>
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
      <section className="relative h-[24rem] sm:h-[min(96vw,42rem)] md:h-[min(72vh,780px)] md:min-h-[560px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_18%] md:bg-top"
          style={{ backgroundImage: `url(${heroPng})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full translate-y-4 md:-translate-y-4 flex flex-col items-center gap-3 md:gap-5 text-center text-white">
          <p className="font-serif text-sm md:text-base tracking-[0.18em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            {t("home.heroEyebrow")}
          </p>
          <h1 className="max-w-4xl font-serif text-4xl leading-[0.98] md:text-6xl lg:text-7xl drop-shadow-[0_3px_12px_rgba(0,0,0,0.5)]">
            {t("home.heroStatement")}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/90 md:text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            {t("home.heroSubline")}
          </p>
          <Link
            href="/galeria"
            data-testid="button-ver-galeria"
            className="mt-2 inline-flex min-w-[15rem] items-center justify-center gap-3 rounded-md bg-[#ead9e5]/95 px-10 py-5 text-sm tracking-[0.22em] uppercase text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.25)] ring-1 ring-white/30 hover:bg-white hover:-translate-y-0.5 transition-all md:min-w-[18rem]"
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
              className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover object-top ring-1 ring-primary/15 shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
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
        <div
          className="mx-auto max-w-6xl overflow-hidden px-6 touch-pan-y select-none"
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
              <figure key={photo} className="w-[calc(100vw-4rem)] max-w-[42rem] shrink-0 md:w-[56vw]">
                <img
                  src={photo}
                  alt={`${t("home.photoGalleryLabel")} — ${index + 1}`}
                  className="h-[22rem] w-full object-contain md:h-[32rem]"
                  draggable={false}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery highlights */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="font-serif text-2xl text-foreground">{t("home.galleryHighlights")}</h2>
            <Link
              href="/galeria"
              className="inline-flex items-center gap-1 mt-3 text-xs tracking-[0.18em] uppercase text-primary border-b border-primary/60 pb-0.5 hover:border-primary transition-colors"
            >
              {t("home.viewAll")}
            </Link>
          </div>

          {obrasLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square" />
                  <Skeleton className="h-4 mt-2 w-3/4" />
                </div>
              ))}
            </div>
          ) : obras && obras.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {obras.map((obra) => (
                <ObraCard key={obra.id} obra={obra} />
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
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">{t("home.agenda")}</p>
          <h2 className="font-serif text-3xl text-foreground mb-8"></h2>

          {eventosLoading ? (
            <div className="border border-border p-8">
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-36" />
            </div>
          ) : proximoEvento ? (
            <div className="border border-border bg-background p-8 flex flex-col md:flex-row md:items-center justify-between gap-6" data-testid={`card-evento-${proximoEvento.id}`}>
              <div className="flex items-start gap-6">
                {proximoEvento.imagemCapaUrl && (
                  <img
                    src={proximoEvento.imagemCapaUrl}
                    alt={proximoEvento.nome}
                    className="w-24 h-24 object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <span className={`text-xs px-2 py-0.5 mb-3 inline-block ${proximoEvento.tipo === "futuro" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    {proximoEvento.tipo === "futuro" ? t("home.nextEvent") : t("home.lastEvent")}
                  </span>
                  <h3 className="font-serif text-xl text-foreground">{proximoEvento.nome}</h3>
                  {proximoEvento.local && (
                    <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {proximoEvento.local}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                    <Calendar size={12} /> {proximoEvento.dataEvento}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
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
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    {t("common.interested")}
                  </a>
                )}
                <Link
                  href="/agenda"
                  data-testid="button-ver-agenda"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary text-sm tracking-widest uppercase hover:bg-primary/5 transition-colors whitespace-nowrap"
                >
                  {t("home.viewAgenda")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-background p-8 text-center">
              <p className="text-muted-foreground font-serif text-lg">{t("home.noEvents")}</p>
              <Link href="/agenda" className="text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5 mt-4 inline-block">
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
