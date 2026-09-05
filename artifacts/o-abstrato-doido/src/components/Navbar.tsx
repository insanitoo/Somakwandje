import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { languageOptions, useLanguage } from "@/i18n";

const links = [
  { href: "/", key: "home" as const, label: "Início" },
  { href: "/galeria", key: "gallery" as const, label: "Obras" },
  { href: "/agenda", key: "agenda" as const, label: "Programa" },
  { href: "/sobre", key: "about" as const, label: "Artista" },
  { href: "/cursos", key: "courses" as const, label: "Estúdio" },
  { href: "/blog", key: "blog" as const, label: "Caderno" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!languageOpen) return;
    const close = (event: PointerEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) setLanguageOpen(false);
    };
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setLanguageOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [languageOpen]);

  return (
    <header className="relative z-50 bg-background">
      <div className="bg-accent text-accent-foreground px-5 py-2 flex items-center justify-between editorial-label text-[9px]">
        <span>Somakwendje · Estúdio aberto</span>
        <span className="hidden sm:inline">Pintura, matéria e pensamento</span>
        <Link href="/agenda" className="flex items-center gap-1 hover:opacity-70" data-testid="link-program-strip">
          {t("nav.agenda")} <ArrowUpRight size={11} />
        </Link>
      </div>
      <div className="border-b border-border/80">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 h-[84px] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="md:hidden p-2 -ml-2 text-foreground"
            aria-label={t("nav.menu")}
            aria-expanded={open}
            data-testid="button-menu-mobile"
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
          <div className="hidden md:flex items-center gap-6 w-1/3">
            <span className="editorial-label text-muted-foreground">Luanda · AO</span>
          </div>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center group" data-testid="link-wordmark">
            <span className="font-serif text-[34px] md:text-[42px] leading-none tracking-[-.05em] text-foreground">Somakwendje</span>
            <span className="block editorial-label text-[8px] text-primary mt-1">artista plástico</span>
          </Link>
          <div className="ml-auto flex items-center justify-end gap-5 w-1/3">
            <nav className="hidden md:flex items-center gap-5">
              {links.slice(1, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`nav-${link.key}`}
                  className={`editorial-label text-[10px] ${location === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="relative" ref={languageRef}>
              <button
                type="button"
                onClick={() => setLanguageOpen((value) => !value)}
                className="flex items-center gap-1 editorial-label text-[10px] text-muted-foreground hover:text-foreground"
                aria-label={t("nav.language")}
                aria-expanded={languageOpen}
                data-testid="select-language"
              >
                {language.toUpperCase()} <ChevronDown size={12} />
              </button>
              {languageOpen && (
                <div className="absolute right-0 top-7 min-w-32 border border-border bg-card shadow-sm py-1" role="menu">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={language === option.code}
                      onClick={() => { setLanguage(option.code); setLanguageOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-xs ${language === option.code ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      data-testid={`language-option-${option.code}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {open && (
          <nav className="md:hidden border-t border-border px-5 py-5 flex flex-col gap-4 bg-background" aria-label="Navegação principal">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${link.key}`}
                className={`font-serif text-2xl ${location === link.href ? "text-primary" : "text-foreground"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}