import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import portraitPng from "@assets/image_1788617913895.png";
import exhibitionPng from "@assets/image_1788618329505.png";
import { useLanguage } from "@/i18n";

export default function Sobre() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[4.5rem]">
        <section className="py-12 md:py-20 bg-background">
          <div className="max-w-5xl mx-auto px-6">
            <img
              src={portraitPng}
              alt="Victor Eurico Somakwendje numa exposição"
              className="w-full aspect-[4/3] object-cover object-[center_35%] rounded-[2.75rem] rounded-bl-[8rem] shadow-[0_18px_42px_rgba(15,23,42,0.1)]"
              data-testid="img-artist-sobre"
            />

            <div className="max-w-3xl mx-auto mt-16 md:mt-24 space-y-5 text-muted-foreground leading-relaxed">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground">{t("about.biographyTitle")}</h1>
              <p>{t("about.paragraph1")}</p>
              <p>{t("about.paragraph2")}</p>
            </div>

            <img
              src={exhibitionPng}
              alt="Victor Eurico Somakwendje diante de uma das suas obras"
              className="w-full max-w-4xl mx-auto mt-16 md:mt-24 rounded-[2.75rem] rounded-tr-[8rem] shadow-[0_18px_42px_rgba(15,23,42,0.1)]"
              data-testid="img-exhibition-sobre"
            />

            <div className="max-w-3xl mx-auto mt-16 md:mt-24 space-y-5 text-muted-foreground leading-relaxed">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">{t("about.statementTitle")}</h2>
              <p>{t("about.paragraph3")}</p>
              <p>{t("about.paragraph4")}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}