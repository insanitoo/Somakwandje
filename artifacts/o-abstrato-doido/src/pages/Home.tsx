import { Link } from "wouter";
import { useListEventos, useListObras } from "@workspace/api-client-react";
import type { Obra } from "@workspace/api-client-react";
import { ArrowDownRight, ArrowUpRight, Calendar, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@assets/hero.png";
import artistImage from "@assets/artista.png";
import { useLanguage, type Language } from "@/i18n";

const WA = "244934959424";
function eventMessage(name: string, language: Language) {
  const copy = {
    pt: `Olá, vi no seu site o evento "${name}" e gostaria de saber mais.`,
    en: `Hello, I saw the event "${name}" on your website and would like to know more.`,
    fr: `Bonjour, j’ai vu l’événement « ${name} » sur votre site et j’aimerais en savoir plus.`,
  };
  return `https://wa.me/${WA}?text=${encodeURIComponent(copy[language])}`;
}

function WorkTile({ obra, index }: { obra: Obra; index: number }) {
  return (
    <Link
      href={`/galeria?obra=${obra.id}`}
      className={`art-card group block ${index === 0 ? "md:row-span-2" : ""}`}
      data-testid={`card-obra-${obra.id}`}
    >
      <div className={`${index === 0 ? "aspect-[3/4]" : "aspect-square"} overflow-hidden bg-muted relative`}>
        {obra.imagemUrl ? <img src={obra.imagemUrl} alt={obra.titulo} className="art-image w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center p-6 text-center font-serif text-2xl text-primary">{obra.titulo}</div>}
        <span className="absolute top-3 left-3 editorial-label text-[9px] bg-background/90 px-2 py-1 text-foreground">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="pt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl leading-none group-hover:text-primary transition-colors">{obra.titulo}</h3>
          {obra.tecnica && <p className="text-xs text-muted-foreground mt-1">{obra.tecnica}</p>}
        </div>
        <ArrowUpRight size={16} className="mt-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </Link>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const { data: obras, isLoading: obrasLoading, isError: obrasError } = useListObras();
  const { data: eventos, isLoading: eventosLoading } = useListEventos();
  const featured = (obras ?? []).filter((obra) => obra.destaque);
  const selectedWorks = (featured.length ? featured : obras ?? []).slice(0, 5);
  const nextEvent = (eventos ?? []).find((event) => event.tipo === "futuro") ?? null;
  const copy = {
    pt: { kicker: "Pintura · Luanda", title: "Um lugar para o que ainda não tem nome.", intro: "Somakwendje é um arquivo vivo de gestos, superfícies e perguntas. Entre na galeria.", works: "Obras recentes", worksLead: "Pinturas que recusam ficar quietas.", studio: "Do estúdio", studioLead: "A pintura começa antes da tela.", programme: "Programa", programmeLead: "Encontros, exposições e aulas que prolongam o trabalho para fora do quadro.", discover: "Entrar na galeria", about: "Conhecer o artista" },
    en: { kicker: "Painting · Luanda", title: "A place for what has no name yet.", intro: "Somakwendje is a living archive of gestures, surfaces and questions. Enter the gallery.", works: "Recent works", worksLead: "Paintings that refuse to stay still.", studio: "From the studio", studioLead: "Painting begins before the canvas.", programme: "Programme", programmeLead: "Encounters, exhibitions and lessons that carry the work beyond the frame.", discover: "Enter the gallery", about: "Meet the artist" },
    fr: { kicker: "Peinture · Luanda", title: "Un lieu pour ce qui n’a pas encore de nom.", intro: "Somakwendje est une archive vivante de gestes, de surfaces et de questions. Entrez dans la galerie.", works: "Œuvres récentes", worksLead: "Des peintures qui refusent l’immobilité.", studio: "Depuis l’atelier", studioLead: "La peinture commence avant la toile.", programme: "Programme", programmeLead: "Rencontres, expositions et cours qui prolongent le travail hors du cadre.", discover: "Entrer dans la galerie", about: "Rencontrer l’artiste" },
  }[language];

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      <main>
        <section className="relative min-h-[calc(100svh-110px)] bg-foreground text-background overflow-hidden flex items-end">
          <img src={heroImage} alt="Obra de Somakwendje" className="absolute inset-0 w-full h-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/15 to-transparent" />
          <div className="relative w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-10 md:pb-16">
            <div className="max-w-4xl">
              <p className="editorial-label text-background/75 mb-5">{copy.kicker}</p>
              <h1 className="font-serif text-[clamp(3.8rem,9vw,9.5rem)] leading-[.8] tracking-[-.06em] max-w-5xl">{copy.title}</h1>
              <div className="mt-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Link href="/galeria" className="group inline-flex items-center gap-6 bg-primary text-primary-foreground px-5 py-4 editorial-label text-[10px] hover:bg-background hover:text-foreground" data-testid="button-ver-galeria">
                  {copy.discover} <ArrowUpRight size={15} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
                <p className="max-w-xs text-sm leading-relaxed text-background/75">{copy.intro}</p>
              </div>
            </div>
            <div className="hidden md:flex absolute right-10 bottom-16 items-center gap-3 editorial-label text-[9px] text-background/60">
              <span className="w-10 h-px bg-background/50" /> scroll to explore
            </div>
          </div>
        </section>

        <section className="max-w-[1440px] mx-auto px-5 md:px-10 py-24 md:py-36">
          <div className="grid grid-cols-1 md:grid-cols-[.9fr_1.6fr] gap-10 md:gap-24 items-start">
            <div className="md:sticky md:top-10">
              <p className="editorial-label text-primary mb-4">01 / {copy.works}</p>
              <h2 className="font-serif text-5xl md:text-7xl leading-[.88] tracking-[-.04em]">{copy.worksLead}</h2>
              <Link href="/galeria" className="inline-flex items-center gap-2 mt-8 line-link editorial-label text-[10px] hover:text-primary" data-testid="link-home-gallery">{t("home.viewAll")} <ArrowUpRight size={14} /></Link>
            </div>
            <div>
              {obrasLoading ? <div className="grid grid-cols-2 gap-5"><Skeleton className="aspect-[3/4]" /><Skeleton className="aspect-square" /><Skeleton className="aspect-square" /></div> : obrasError ? <div className="border border-primary/30 p-8 text-sm text-muted-foreground">A galeria está a ser preparada. Volte em breve.</div> : selectedWorks.length ? <div className="grid grid-cols-2 gap-x-5 gap-y-10">{selectedWorks.map((obra, index) => <WorkTile key={obra.id} obra={obra} index={index} />)}</div> : <div className="border border-border p-10 text-muted-foreground">{t("home.worksSoon")}</div>}
            </div>
          </div>
        </section>

        <section className="bg-accent text-accent-foreground">
          <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-24 md:py-32 grid grid-cols-1 md:grid-cols-[.85fr_1fr] gap-12 md:gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-5 -left-5 w-20 h-20 border border-primary/60" />
              <img src={artistImage} alt="Somakwendje no estúdio" className="relative w-full max-w-md aspect-[4/5] object-cover grayscale-[.15]" data-testid="img-artist-home" />
            </div>
            <div>
              <p className="editorial-label text-background/60 mb-5">02 / {copy.studio}</p>
              <h2 className="font-serif text-5xl md:text-8xl leading-[.82] tracking-[-.05em]">{copy.studioLead}</h2>
              <p className="mt-8 text-sm md:text-base leading-relaxed text-background/70 max-w-md">{copy.intro}</p>
              <Link href="/sobre" className="mt-9 inline-flex items-center gap-2 line-link editorial-label text-[10px] hover:text-primary" data-testid="button-saber-mais">{copy.about} <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section className="studio-grid">
          <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-24 md:py-32">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
              <div><p className="editorial-label text-primary mb-4">03 / {copy.programme}</p><h2 className="font-serif text-5xl md:text-7xl leading-[.85]">{copy.programmeLead}</h2></div>
              <Link href="/agenda" className="self-end line-link editorial-label text-[10px] hover:text-primary" data-testid="link-home-agenda">{t("home.viewAgenda")} <ArrowUpRight size={14} className="inline ml-2" /></Link>
            </div>
            {eventosLoading ? <div className="border-y border-border py-8"><Skeleton className="h-8 w-1/2" /></div> : nextEvent ? <div className="border-y border-foreground/20 py-7 grid grid-cols-[auto_1fr] md:grid-cols-[120px_1fr_auto] gap-6 items-center" data-testid={`card-evento-${nextEvent.id}`}>
              <div className="editorial-label text-primary"><Calendar size={16} className="mb-2" /> {t("home.nextEvent")}</div>
              <div><h3 className="font-serif text-3xl md:text-5xl">{nextEvent.nome}</h3><div className="flex flex-wrap gap-4 mt-2 text-xs text-background/65"><span className="flex items-center gap-1"><Calendar size={12} /> {nextEvent.dataEvento}</span>{nextEvent.local && <span className="flex items-center gap-1"><MapPin size={12} /> {nextEvent.local}</span>}</div></div>
              <a href={eventMessage(nextEvent.nome, language)} target="_blank" rel="noopener noreferrer" className="editorial-label text-[10px] border border-background/40 px-4 py-3 hover:bg-background hover:text-accent" data-testid={`button-interessado-evento-${nextEvent.id}`}>{t("common.interested")}</a>
            </div> : <div className="border-y border-border py-8 text-muted-foreground">{t("home.noEvents")}</div>}
          </div>
        </section>
        <section className="max-w-[1440px] mx-auto px-5 md:px-10 py-20 flex items-center justify-between gap-6">
          <p className="font-serif text-3xl md:text-5xl max-w-2xl">O quadro termina. A pergunta continua.</p>
          <ArrowDownRight className="text-primary shrink-0" size={34} />
        </section>
      </main>
      <Footer />
    </div>
  );
}