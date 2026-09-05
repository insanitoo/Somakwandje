import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import artistPng from "@assets/image_1788615145695.png";
import { useLanguage } from "@/i18n";

export default function Sobre() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[4.5rem]">
        <section className="py-14 md:py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 md:gap-16 items-start">
            <div>
              <img
                src={artistPng}
                alt="Victor Eurico Somakwendje"
                className="w-full max-w-md mx-auto aspect-square rounded-full object-cover object-top shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
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