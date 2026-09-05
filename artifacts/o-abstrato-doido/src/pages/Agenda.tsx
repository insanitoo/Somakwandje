import { useState } from "react";
import { useListEventos } from "@workspace/api-client-react";
import type { Evento } from "@workspace/api-client-react";
import { ArrowUpRight, Calendar, MapPin, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLanguage, type Language } from "@/i18n";

const WA = "244934959424";
function contact(name: string, language: Language) {
  const copy = { pt: `Olá, vi no site o evento "${name}" e gostaria de saber mais / inscrever-me.`, en: `Hello, I saw the event "${name}" on your website and would like to know more / register.`, fr: `Bonjour, j’ai vu l’événement « ${name} » sur votre site et j’aimerais en savoir plus / m’inscrire.` };
  return `https://wa.me/${WA}?text=${encodeURIComponent(copy[language])}`;
}
function galleryImages(event: Evento) {
  let extra: string[] = [];
  try { const parsed = event.imagensAdicionais ? JSON.parse(event.imagensAdicionais) : []; if (Array.isArray(parsed)) extra = parsed.filter(Boolean); } catch { extra = []; }
  return [event.imagemCapaUrl, ...extra].filter((url): url is string => Boolean(url));
}

function EventModal({ event, close }: { event: Evento; close: () => void }) {
  const { t, language } = useLanguage();
  const images = galleryImages(event);
  const future = event.tipo === "futuro";
  return <DialogContent hideClose className="max-w-4xl rounded-none p-0 overflow-hidden max-h-[90dvh] bg-card" aria-describedby={undefined}>
    <DialogTitle className="sr-only">{event.nome}</DialogTitle>
    <button type="button" onClick={close} className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-background/90 hover:bg-primary hover:text-primary-foreground" aria-label={t("common.close")} data-testid="button-close-event"><X size={17} /></button>
    <div className="grid grid-cols-1 md:grid-cols-[.9fr_1.1fr] max-h-[90dvh]">
      <div className="bg-foreground min-h-[260px]">{images[0] ? <img src={images[0]} alt={event.nome} className="w-full h-full min-h-[320px] object-cover" data-testid={`img-event-${event.id}`} /> : <div className="h-full min-h-[320px] flex items-center justify-center p-8 font-serif text-4xl text-background/70 text-center">{event.nome}</div>}</div>
      <div className="overflow-y-auto p-8 md:p-12"><p className="editorial-label text-primary mb-5">{future ? t("agenda.upcomingEvent") : t("agenda.completedEvent")}</p><h2 className="font-serif text-5xl leading-[.82]">{event.nome}</h2><div className="mt-9 space-y-3 text-sm text-muted-foreground"><p className="flex gap-2 items-center"><Calendar size={14} /> {event.dataEvento}</p>{event.local && <p className="flex gap-2 items-center"><MapPin size={14} /> {event.local}</p>}</div>{event.descricao && <p className="mt-8 text-sm leading-relaxed whitespace-pre-line">{event.descricao}</p>}{future && <a href={event.linkInscricao || contact(event.nome, language)} target="_blank" rel="noopener noreferrer" className="mt-10 flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground editorial-label text-[10px] hover:bg-accent" data-testid={`link-register-event-${event.id}`}>{t("common.interested")} <ArrowUpRight size={15} /></a>}</div>
    </div>
  </DialogContent>;
}

function EventRow({ event, future, open }: { event: Evento; future: boolean; open: () => void }) {
  const { t } = useLanguage();
  return <button type="button" onClick={open} className="w-full text-left border-t border-border py-7 grid grid-cols-[1fr_auto] md:grid-cols-[120px_1fr_auto] gap-5 items-center group hover:bg-secondary/30" data-testid={`card-evento-${event.id}`}>
    <div className="editorial-label text-[9px] text-primary">{future ? "A seguir" : "Arquivo"}<span className="block text-muted-foreground mt-2"><Calendar size={13} className="inline mr-1" />{event.dataEvento}</span></div>
    <div className="flex items-center gap-5">{event.imagemCapaUrl && <img src={event.imagemCapaUrl} alt="" className="hidden sm:block w-20 h-20 object-cover" />}<div><h3 className="font-serif text-3xl md:text-4xl group-hover:text-primary">{event.nome}</h3>{event.local && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin size={12} /> {event.local}</p>}</div></div>
    <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1" />
  </button>;
}

export default function Agenda() {
  const { t, language } = useLanguage();
  const { data: events, isLoading, isError } = useListEventos();
  const [selected, setSelected] = useState<Evento | null>(null);
  const future = (events ?? []).filter((event) => event.tipo === "futuro");
  const past = (events ?? []).filter((event) => event.tipo === "passado");
  return <div className="min-h-screen bg-background grain"><Navbar /><main className="max-w-[1440px] mx-auto px-5 md:px-10"><section className="pt-20 pb-16 md:pt-28 md:pb-24 grid md:grid-cols-[1fr_.7fr] gap-8 items-end"><div><p className="editorial-label text-primary mb-5">Arquivo / 02</p><h1 className="font-serif text-[clamp(4rem,10vw,9rem)] leading-[.75] tracking-[-.07em]">{t("agenda.title")}</h1></div><p className="text-sm leading-relaxed text-muted-foreground max-w-xs md:pb-2">{language === "pt" ? "A vida da pintura também acontece quando saímos do estúdio." : language === "fr" ? "La vie de la peinture existe aussi lorsque nous sortons de l’atelier." : "Painting also lives beyond the studio."}</p></section>
    {isError ? <div className="py-24 text-center border-y border-primary/30">Não foi possível carregar o programa.</div> : isLoading ? <div className="space-y-4 py-10">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-28 w-full" />)}</div> : <div className="pb-24"><section><div className="flex items-baseline justify-between border-b border-foreground pb-4"><h2 className="font-serif text-4xl">{t("agenda.upcoming")}</h2><span className="editorial-label text-[9px] text-muted-foreground">{String(future.length).padStart(2, "0")}</span></div>{future.length ? future.map((event) => <EventRow key={event.id} event={event} future open={() => setSelected(event)} />) : <p className="py-10 text-sm text-muted-foreground">{t("agenda.noUpcoming")}</p>}</section><section className="mt-24"><div className="flex items-baseline justify-between border-b border-border pb-4"><h2 className="font-serif text-4xl text-muted-foreground">{t("agenda.past")}</h2><span className="editorial-label text-[9px] text-muted-foreground">{String(past.length).padStart(2, "0")}</span></div>{past.length ? past.map((event) => <EventRow key={event.id} event={event} future={false} open={() => setSelected(event)} />) : <p className="py-10 text-sm text-muted-foreground">{t("agenda.noPast")}</p>}</section></div>}
  </main><Footer /><Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>{selected && <EventModal event={selected} close={() => setSelected(null)} />}</Dialog></div>;
}