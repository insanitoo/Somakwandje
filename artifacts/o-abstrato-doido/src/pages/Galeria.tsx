import { useEffect, useMemo, useState } from "react";
import { getGetObraQueryKey, useGetObra, useListObras } from "@workspace/api-client-react";
import type { Obra } from "@workspace/api-client-react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLanguage, type Language } from "@/i18n";

const WA = "244934959424";
function message(titulo: string, language: Language) {
  const copy = {
    pt: `Olá, vi no seu site que a obra "${titulo}" está disponível. Gostaria de saber mais.`,
    en: `Hello, I saw that "${titulo}" is available on your website. I would like to know more.`,
    fr: `Bonjour, j’ai vu que l’œuvre « ${titulo} » est disponible. J’aimerais en savoir plus.`,
  };
  return `https://wa.me/${WA}?text=${encodeURIComponent(copy[language])}`;
}
function photos(obra: Obra) {
  return [obra.imagemUrl, obra.imagemUrl2, obra.imagemUrl3, obra.imagemUrl4, obra.imagemUrl5, obra.imagemUrl6, obra.imagemUrl7, obra.imagemUrl8, obra.imagemUrl9, obra.imagemUrl10].filter((url): url is string => Boolean(url));
}
function price(value?: string | null) {
  if (!value) return null;
  const amount = Number.parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isNaN(amount) ? value : `${amount.toLocaleString("pt-AO")} Kz`;
}

function WorkModal({ obra, onClose }: { obra: Obra; onClose: () => void }) {
  const { t, language } = useLanguage();
  const images = photos(obra);
  const [index, setIndex] = useState(0);
  return (
    <DialogContent hideClose className="max-w-5xl rounded-none p-0 overflow-hidden max-h-[92dvh] bg-card" aria-describedby={undefined}>
      <DialogTitle className="sr-only">{obra.titulo}</DialogTitle>
      <button type="button" onClick={onClose} aria-label={t("common.close")} className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-background/90 hover:bg-primary hover:text-primary-foreground" data-testid="button-close-work"><X size={17} /></button>
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_.8fr] max-h-[92dvh]">
        <div className="bg-foreground min-h-[320px] md:min-h-[620px] relative flex items-center justify-center">
          {images.length ? <img src={images[index]} alt={obra.titulo} className="w-full h-full max-h-[72dvh] object-contain" /> : <p className="font-serif text-3xl text-background/70 p-8 text-center">{obra.titulo}</p>}
          {images.length > 1 && <><button type="button" onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center" aria-label={t("common.previous")} data-testid="button-previous-work-image"><ChevronLeft size={17} /></button><button type="button" onClick={() => setIndex((i) => (i + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center" aria-label={t("common.next")} data-testid="button-next-work-image"><ChevronRight size={17} /></button><span className="absolute bottom-4 left-1/2 -translate-x-1/2 editorial-label text-[9px] bg-foreground/70 text-background px-3 py-2">{index + 1} / {images.length}</span></>}
        </div>
        <div className="p-7 md:p-10 overflow-y-auto">
          <p className="editorial-label text-primary mb-4">{obra.status === "disponivel" ? t("common.available") : t("common.soldFemale")}</p>
          <h2 className="font-serif text-5xl leading-[.85] tracking-[-.04em]">{obra.titulo}</h2>
          <div className="mt-10 space-y-5 text-sm">
            {obra.tecnica && <div><p className="editorial-label text-[9px] text-muted-foreground mb-1">{t("gallery.technique")}</p><p>{obra.tecnica}</p></div>}
            {obra.dimensoes && <div><p className="editorial-label text-[9px] text-muted-foreground mb-1">{t("gallery.dimensions")}</p><p>{obra.dimensoes}</p></div>}
            {obra.descricao && <div><p className="editorial-label text-[9px] text-muted-foreground mb-1">{t("common.description")}</p><p className="leading-relaxed text-muted-foreground">{obra.descricao}</p></div>}
            {obra.status === "disponivel" && <div><p className="editorial-label text-[9px] text-muted-foreground mb-1">{t("gallery.price")}</p><p className="font-serif text-2xl">{price(obra.preco) ?? t("common.priceOnRequest")}</p></div>}
          </div>
          <div className="mt-12">{obra.status === "disponivel" ? <a href={message(obra.titulo, language)} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center bg-primary text-primary-foreground px-5 py-4 editorial-label text-[10px] hover:bg-accent" data-testid={`link-contact-work-${obra.id}`}>{t("gallery.moreInfo")} <ArrowUpRight size={15} /></a> : <div className="border border-border px-5 py-4 editorial-label text-[10px] text-muted-foreground">{t("gallery.workSold")}</div>}</div>
        </div>
      </div>
    </DialogContent>
  );
}

export default function Galeria() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<"todas" | "disponivel" | "vendido">("todas");
  const [size, setSize] = useState<"todos" | "grande" | "media" | "pequena">("todos");
  const [selected, setSelected] = useState<Obra | null>(null);
  const idFromUrl = Number(new URLSearchParams(window.location.search).get("obra")) || 0;
  const params = useMemo(() => ({ ...(status !== "todas" ? { status } : {}), ...(size !== "todos" ? { tamanho: size } : {}) }), [size, status]);
  const { data: obras, isLoading, isError } = useListObras(Object.keys(params).length ? params : undefined);
  const { data: shared } = useGetObra(idFromUrl, { query: { enabled: idFromUrl > 0, queryKey: getGetObraQueryKey(idFromUrl) } });
  useEffect(() => { if (!selected && idFromUrl > 0 && shared) setSelected(shared); }, [idFromUrl, selected, shared]);
  const close = () => { setSelected(null); window.history.replaceState(null, "", "/galeria"); };
  const labels = language === "pt" ? { intro: "Uma seleção de pinturas e trabalhos em matéria.", filter: "Filtrar", all: "Todas", large: "Grande", medium: "Média", small: "Pequena" } : language === "fr" ? { intro: "Une sélection de peintures et de travaux de matière.", filter: "Filtrer", all: "Toutes", large: "Grande", medium: "Moyenne", small: "Petite" } : { intro: "A selection of paintings and works in material.", filter: "Filter", all: "All", large: "Large", medium: "Medium", small: "Small" };
  const list = obras ?? [];
  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      <main className="max-w-[1440px] mx-auto px-5 md:px-10">
        <section className="pt-20 pb-16 md:pt-28 md:pb-24 grid grid-cols-1 md:grid-cols-[1fr_.7fr] gap-8 items-end">
          <div><p className="editorial-label text-primary mb-5">Arquivo / 01</p><h1 className="font-serif text-[clamp(4rem,10vw,9rem)] leading-[.75] tracking-[-.07em]">{t("gallery.title")}</h1></div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed md:pb-2">{labels.intro}</p>
        </section>
        <section className="sticky top-0 z-30 -mx-5 md:-mx-10 px-5 md:px-10 py-4 bg-background/95 backdrop-blur border-y border-border flex flex-wrap items-center gap-2" aria-label={labels.filter}>
          <span className="editorial-label text-[9px] text-muted-foreground mr-2">{labels.filter}</span>
          {([["todas", labels.all], ["disponivel", t("common.availablePlural")], ["vendido", t("common.soldPlural")]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setStatus(value)} className={`px-3 py-2 editorial-label text-[9px] border ${status === value ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`} data-testid={`filter-status-${value}`}>{label}</button>)}
          <span className="w-px h-5 bg-border mx-2" />
          {([["todos", labels.all], ["grande", labels.large], ["media", labels.medium], ["pequena", labels.small]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setSize(value)} className={`px-3 py-2 editorial-label text-[9px] border ${size === value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`} data-testid={`filter-size-${value}`}>{label}</button>)}
        </section>
        <section className="py-12 md:py-20">
          {isLoading ? <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-12">{Array.from({ length: 6 }).map((_, i) => <div key={i}><Skeleton className="aspect-[4/5]" /><Skeleton className="h-5 w-2/3 mt-4" /></div>)}</div> : isError ? <div className="py-24 text-center border border-primary/30"><p className="font-serif text-3xl">A galeria não está disponível.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 line-link editorial-label text-[10px]" data-testid="button-retry-gallery">Tentar novamente</button></div> : list.length ? <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-14">{list.map((obra, i) => <button type="button" onClick={() => setSelected(obra)} key={obra.id} className="art-card group text-left" data-testid={`card-obra-${obra.id}`}><div className="aspect-[4/5] overflow-hidden bg-muted relative">{obra.imagemUrl ? <img src={obra.imagemUrl} alt={obra.titulo} className="art-image w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center p-5 text-center font-serif text-2xl text-primary">{obra.titulo}</div>}<span className="absolute top-3 left-3 editorial-label text-[9px] bg-background/90 px-2 py-1">{String(i + 1).padStart(2, "0")}</span>{obra.status === "vendido" && <span className="absolute bottom-3 left-3 editorial-label text-[9px] bg-foreground text-background px-2 py-1">{t("common.sold")}</span>}</div><div className="pt-4 flex justify-between gap-3"><div><h2 className="font-serif text-2xl leading-none group-hover:text-primary">{obra.titulo}</h2><p className="text-xs text-muted-foreground mt-2">{obra.tecnica ?? t("common.available")}</p></div><ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary" /></div></button>)}</div> : <div className="py-32 text-center border-y border-border"><p className="font-serif text-4xl">{t("gallery.noWorks")}</p><button type="button" onClick={() => { setStatus("todas"); setSize("todos"); }} className="mt-5 line-link editorial-label text-[10px]" data-testid="button-reset-filters">{t("gallery.seeAll")}</button></div>}
        </section>
      </main>
      <Footer />
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && close()}>{selected && <WorkModal obra={selected} onClose={close} />}</Dialog>
    </div>
  );
}