import { Link } from "wouter";
import { useListBlog } from "@workspace/api-client-react";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n";

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export default function Blog() {
  const { t, locale, language } = useLanguage();
  const { data: posts, isLoading, isError } = useListBlog();
  const copy = language === "pt" ? { lead: "Notas do processo, pensamentos em trânsito e outras formas de olhar.", featured: "Em destaque" } : language === "fr" ? { lead: "Notes de processus, pensées en mouvement et autres façons de regarder.", featured: "À la une" } : { lead: "Process notes, thoughts in motion and other ways of looking.", featured: "Featured" };
  return <div className="min-h-screen bg-background grain"><Navbar /><main className="max-w-[1440px] mx-auto px-5 md:px-10"><section className="pt-20 pb-16 md:pt-28 md:pb-24 grid md:grid-cols-[1fr_.7fr] gap-8 items-end"><div><p className="editorial-label text-primary mb-5">Arquivo / 04</p><h1 className="font-serif text-[clamp(4rem,10vw,9rem)] leading-[.75] tracking-[-.07em]">{t("blog.title")}</h1></div><p className="text-sm leading-relaxed text-muted-foreground max-w-xs md:pb-2">{copy.lead}</p></section><section className="pb-24">{isError ? <div className="py-24 border-y border-primary/30 text-center">O caderno não está disponível.</div> : isLoading ? <div className="space-y-5">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-44 w-full" />)}</div> : posts?.length ? <div className="space-y-16">{posts.map((post, index) => <Link key={post.id} href={`/blog/${post.id}`} className={`group grid grid-cols-1 md:grid-cols-[.9fr_1.1fr] gap-7 md:gap-12 items-center ${index === 0 ? "pb-16 border-b border-foreground" : ""}`} data-testid={`card-post-${post.id}`}>{post.imagemCapaUrl ? <div className="aspect-[16/10] overflow-hidden bg-muted"><img src={post.imagemCapaUrl} alt={post.titulo} className="art-image w-full h-full object-cover" /></div> : <div className="aspect-[16/10] bg-accent flex items-center justify-center"><span className="font-serif text-8xl text-background/20">S</span></div>}<div className="py-2"><p className="editorial-label text-primary text-[9px] mb-5">{index === 0 ? copy.featured : formatDate(post.dataPublicacao, locale)}</p><h2 className="font-serif text-4xl md:text-6xl leading-[.86] tracking-[-.04em] group-hover:text-primary">{post.titulo}</h2><p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-lg">{post.conteudo.length > 180 ? `${post.conteudo.slice(0, 180)}…` : post.conteudo}</p><span className="mt-8 inline-flex items-center gap-2 line-link editorial-label text-[10px]">{t("blog.readMore")} <ArrowUpRight size={14} /></span></div></Link>)}</div> : <div className="py-32 text-center border-y border-border"><p className="font-serif text-4xl">{t("blog.noPosts")}</p><p className="mt-3 text-sm text-muted-foreground">{t("blog.comeBack")}</p></div>}</section></main><Footer /></div>;
}