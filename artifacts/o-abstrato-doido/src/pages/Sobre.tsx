import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import artistPng from "@assets/00e79b8a-e616-4d9a-a14d-930bfb0bffb1_1788518663426.jpeg";
import { useLanguage } from "@/i18n";

export default function Sobre() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section className="py-14 md:py-20 bg-[hsl(40,43%,96%)]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 md:gap-16 items-start">
            <div>
              <img
                src={artistPng}
                alt="Dioleny Intya no atelier"
                className="w-full aspect-[4/5] object-cover"
                data-testid="img-artist-sobre"
              />
            </div>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                {t("about.paragraph1")}
              </p>
              <p>
                {t("about.paragraph2")}
              </p>
              <p>
                {t("about.paragraph3")}
              </p>
              <p>
                {t("about.paragraph4")}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}