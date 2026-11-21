import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Globe2, Menu, X } from "lucide-react";
import { languageOptions, useLanguage } from "@/i18n";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const links = [
  { href: "/", key: "home" as const },
  { href: "/galeria", key: "gallery" as const },
  { href: "/agenda", key: "agenda" as const },
  { href: "/sobre", key: "about" as const },
];

export default function Navbar({ fixed = true }: { fixed?: boolean } = {}) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!languageMenuOpen) return;

    function handleOutsidePointerDown(event: PointerEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setLanguageMenuOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [languageMenuOpen]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);

      if (event.key === "Tab") {
        const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      menuTriggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <nav className={`${fixed ? "fixed" : "relative"} top-0 left-0 right-0 z-50 bg-background border-b border-border`}>
      <div className="relative max-w-6xl mx-auto px-5 md:px-6 h-[4.5rem] flex items-center justify-center md:justify-between">
        <button
          ref={menuTriggerRef}
          className="absolute left-5 md:hidden text-foreground hover:text-primary transition-colors"
          onClick={() => setOpen((current) => !current)}
          data-testid="button-menu-mobile"
          aria-label={t("nav.menu")}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-serif text-xl tracking-wide text-foreground hover:text-primary transition-colors">
          Somakwendje
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7 absolute left-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-testid={`nav-${link.key}`}
              className={`text-sm tracking-widest uppercase transition-colors ${
                location === link.href
                  ? "text-primary font-medium border-b border-primary pb-0.5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
        </div>

        {/* Language selector */}
        <div className="absolute right-5 md:right-6 flex items-center">
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              onClick={() => setLanguageMenuOpen((current) => !current)}
              aria-label={t("nav.language")}
              aria-haspopup="menu"
              aria-expanded={languageMenuOpen}
              title={t("nav.language")}
              className="flex items-center justify-center p-1 text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="select-language"
            >
              <Globe2 size={18} strokeWidth={1.7} aria-hidden="true" />
            </button>
            {languageMenuOpen && (
              <div
                role="menu"
                aria-label={t("nav.language")}
                className="absolute right-0 top-full mt-3 min-w-32 rounded-2xl bg-background border border-border shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-1 z-50"
              >
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    role="menuitemradio"
                    aria-checked={language === option.code}
                    onClick={() => {
                      setLanguage(option.code);
                      setLanguageMenuOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-xs transition-colors ${
                      language === option.code
                        ? "text-primary font-medium bg-primary/5 rounded-xl"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground rounded-xl"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal={open}
        aria-label={t("nav.menu")}
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] flex h-[100dvh] flex-col bg-background px-7 pb-10 pt-6 transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border pb-5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="font-serif text-xl tracking-wide text-foreground"
          >
            Somakwendje
          </Link>
          <button
            ref={menuCloseRef}
            type="button"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            aria-label={t("common.close")}
            className="flex h-11 w-11 items-center justify-center text-foreground hover:text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <nav aria-label={t("nav.menu")} className="flex flex-1 flex-col justify-center gap-7">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              data-testid={`mobile-nav-${link.key}`}
              className={`font-serif text-3xl transition-colors ${
                location === link.href ? "text-primary" : "text-foreground hover:text-primary"
              }`}
              style={{ transitionDelay: open ? `${index * 45}ms` : "0ms" }}
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
        </nav>
      </div>
    </nav>
  );
}
