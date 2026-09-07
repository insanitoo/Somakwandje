import { Mail, Phone, Instagram } from "lucide-react";
import { useLanguage } from "@/i18n";

function FacebookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TikTokIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
    </svg>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h3 className="font-serif text-xl mb-4 text-white">{t("footer.contacts")}</h3>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:victorsomakwendje08@gmail.com"
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm"
              data-testid="link-email"
            >
              <Mail size={16} />
              victorsomakwendje08@gmail.com
            </a>
            <a
              href="https://wa.me/244952582536"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm"
              data-testid="link-phone"
            >
              <Phone size={16} />
              +244 952 582 536
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-xl mb-4 text-white">{t("footer.social")}</h3>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/somakwendje_oficial?igsi=ZTExOTFrbzk1aDdk&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors"
              data-testid="link-instagram"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
            <a
              href="https://www.tiktok.com/@somakwendje_oficial?_r=1&_t=ZS-99U7N4thIKS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors"
              data-testid="link-tiktok"
              aria-label="TikTok"
            >
              <TikTokIcon size={22} />
            </a>
            <a
              href="https://www.facebook.com/share/1Eu8TYKwM2/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors"
              data-testid="link-facebook"
              aria-label="Facebook"
            >
              <FacebookIcon size={22} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 px-6 text-center text-white text-xs">
        © {new Date().getFullYear()} Somakwendje. {t("footer.rights")}
      </div>
    </footer>
  );
}
