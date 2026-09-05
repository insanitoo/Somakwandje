import { Link, useParams } from "wouter";
import { getGetBlogPostQueryKey, useGetBlogPost } from "@workspace/api-client-react";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n";

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPost() {
  const { t, locale } = useLanguage();
  const params = useParams<{ id: string }>();
  const id = Number.parseInt(params.id ?? "0", 10);
  const { data: post, isLoading, isError } = useGetBlogPost(id, { query: { enabled: id > 0, queryKey: getGetBlogPostQueryKey(id) } });
  return <div className="min-h-screen bg-background grain"><Navbar /><main>{isLoading ? <div className="max-w-3xl mx-auto px-5 py-24"><Skeleton className="h-5 w-28 mb-8" /><Skeleton className="h-20 w-full mb-8" /><Skeleton className="aspect-video w-full" /></div> : isError || !post ? <div className="max-w-3xl mx-auto px-5 py-32 text-center"><p className="font-serif text-4xl">{t("blogPost.notFound")}</p><Link href="/blog" className="mt-6 inline-flex items-center gap-2 line-link editorial-label text-[10px]" data-testid="link-back-blog"><ArrowLeft size={14} /> {t("blogPost.goBack")}</Link></div> : <><div className="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 md:pt-24"><Link href="/blog" className="inline-flex items-center gap-2 line-link editorial-label text-[10px] text-muted-foreground hover:text-primary" data-testid="link-back-blog"><ArrowLeft size={14} /> {t("blogPost.back")}</Link><div className="max-w-4xl pt-12 pb-16"><p className="editorial-label text-primary text-[9px] mb-5">{formatDate(post.dataPublicacao, locale)}</p><h1 className="font-serif text-[clamp(3.5rem,8vw,8rem)] leading-[.78] tracking-[-.06em]">{post.titulo}</h1></div></div>{post.imagemCapaUrl && <div className="max-w-[1440px] mx-auto px-5 md:px-10"><img src={post.imagemCapaUrl} alt={post.titulo} className="w-full max-h-[680px] object-cover" /></div>}<article className="max-w-2xl mx-auto px-5 py-20 md:py-28 text-lg leading-relaxed whitespace-pre-wrap">{post.conteudo}</article></>}</main><Footer /></div>;
}