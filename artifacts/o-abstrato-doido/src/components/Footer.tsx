import { ArrowUpRight, Instagram, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-[1.25fr_.7fr_.7fr_.7fr] gap-12 md:gap-8">
          <div>
            <p className="font-serif text-5xl md:text-7xl tracking-[-.05em]">Somakwendje</p>
            <p className="editorial-label text-[9px] text-background/55 mt-4 max-w-xs leading-[1.8]">Pintura como um lugar de encontro entre a matéria, a memória e aquilo que ainda não tem nome.</p>
          </div>
          <div>
            <p className="editorial-label text-[9px] text-background/45 mb-5">{t("footer.contacts")}</p>
            <div className="space-y-3 text-sm">
              <a href="mailto:diolenyintya@gmail.com" className="flex items-center gap-2 hover:text-primary" data-testid="link-email"><Mail size={14} /> diolenyintya@gmail.com</a>
              <a href="https://wa.me/244934959424" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary" data-testid="link-phone"><Phone size={14} /> +244 934 959 424</a>
            </div>
          </div>
          <div>
            <p className="editorial-label text-[9px] text-background/45 mb-5">Explorar</p>
            <div className="space-y-3 text-sm">
              <Link href="/galeria" className="block hover:text-primary" data-testid="footer-link-gallery">Obras</Link>
              <Link href="/agenda" className="block hover:text-primary" data-testid="footer-link-agenda">Programa</Link>
              <Link href="/sobre" className="block hover:text-primary" data-testid="footer-link-about">Artista</Link>
              <Link href="/cursos" className="block hover:text-primary" data-testid="footer-link-courses">Estúdio</Link>
              <Link href="/blog" className="block hover:text-primary" data-testid="footer-link-blog">Caderno</Link>
            </div>
          </div>
          <div>
            <p className="editorial-label text-[9px] text-background/45 mb-5">Acompanhar</p>
            <div className="flex gap-5">
              <a href="https://www.instagram.com/o.abstrato.doido?igsh=dmVwZnV3dGlreDN4" target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="link-instagram" className="hover:text-primary"><Instagram size={19} /></a>
              <a href="https://www.facebook.com/profile.php?id=61565947238625" target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-testid="link-facebook" className="hover:text-primary"><ArrowUpRight size={19} /></a>
            </div>
            <p className="mt-8 text-xs text-background/45 leading-relaxed">O estúdio abre em diferentes momentos. Consulte a agenda para encontros e exposições.</p>
          </div>
        </div>
        <div className="mt-20 pt-5 border-t border-background/15 flex flex-col sm:flex-row justify-between gap-3 text-[10px] text-background/40 editorial-label">
          <span>© {new Date().getFullYear()} Somakwendje</span>
          <span>{t("footer.rights")}</span>
        </div>
      </div>
    </footer>
  );
}