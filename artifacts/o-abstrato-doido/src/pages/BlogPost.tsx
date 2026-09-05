import { Link, useParams } from "wouter";
import { useGetBlogPost, getGetBlogPostQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n";


function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPost() {
  const { t, locale } = useLanguage();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data: post, isLoading } = useGetBlogPost(id, {
    query: { enabled: !!id, queryKey: getGetBlogPostQueryKey(id) },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[4.5rem]">
        {isLoading ? (
          <div className="max-w-3xl mx-auto px-6 py-16">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-32 mb-8" />
            <Skeleton className="aspect-video w-full mb-8" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        ) : post ? (
          <>
            {post.imagemCapaUrl && (
              <div className="w-full h-64 md:h-96 overflow-hidden">
                <img
                  src={post.imagemCapaUrl}
                  alt={post.titulo}
                  className="w-full h-full ob
                  -º« ewq Wn6zaject-cover"
                />
              </div>
            )}
            <div className="max-w-3xl mx-auto px-6 py-16">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
                 {t("blogPost.back")}
              </Link>
              <p className="text-xs text-muted-foreground tracking-widest uppercase mb-4">
                 {formatDate(post.dataPublicacao, locale)}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground leading-tight mb-8">
                {post.titulo}
              </h1>
              <div className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                {post.conteudo}
              </div>
            </div>
          </>
        ) : (
           <div className="py-32 text-center">
             <p className="font-serif text-2xl text-muted-foreground">{t("blogPost.notFound")}</p>
            <Link href="/blog" className="text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5 mt-4 inline-block">
               {t("blogPost.goBack")}
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
