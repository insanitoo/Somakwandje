import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getGetObraQueryKey, useGetObra, useListObras } from "@workspace/api-client-react";
import type { Obra } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useLanguage, type Language } from "@/i18n";

type StatusFilter = "todas" | "disponivel" | "vendido";
type CategoryFilter = "todas" | NonNullable<Obra["categoria"]>;
type Translate = ReturnType<typeof useLanguage>["t"];

const categoryOptions = [
  { value: "pintura_desenho", label: "gallery.categoryPaintingDrawing" },
  { value: "escultura_objetos", label: "gallery.categorySculptureObjects" },
  { value: "fotografia_arte_digital", label: "gallery.categoryPhotographyDigitalArt" },
  { value: "instalacoes", label: "gallery.categoryInstallations" },
] as const;

const artworkPairShapes = [
  "48% 18% 18% 48% / 44% 22% 22% 44%",
  "18% 48% 48% 18% / 22% 44% 44% 22%",
] as const;

function getCategoryLabel(category: Obra["categoria"], t: Translate): string | null {
  switch (category) {
    case "pintura_desenho":
      return t("gallery.categoryPaintingDrawing");
    case "escultura_objetos":
      return t("gallery.categorySculptureObjects");
    case "fotografia_arte_digital":
      return t("gallery.categoryPhotographyDigitalArt");
    case "instalacoes":
      return t("gallery.categoryInstallations");
    default:
      return null;
  }
}

function parsePrecoNum(preco: string | null | undefined): number | null {
  if (!preco) return null;
  const num = parseFloat(preco.replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(num) ? null : num;
}

function formatPreco(num: number): string {
  return `${num.toLocaleString("pt-AO")} Kz`;
}

function formatObraPreco(preco: string | null | undefined): string | null {
  const num = parsePrecoNum(preco);
  if (num === null) return preco ?? null;
  return formatPreco(num);
}

function getEffectiveDesconto(obra: Obra, globalDesconto: number): number {
  if (obra.desconto != null && obra.desconto > 0) return obra.desconto;
  return globalDesconto;
}

const WA = "244952582536";

function buildWA(titulo: string, language: Language) {
  const messages: Record<Language, string> = {
    pt: `Olá, vi no seu site que a obra "${titulo}" ainda está disponível... Gostaria de comprá-la.`,
    en: `Hello, I saw on your website that the work "${titulo}" is still available. I would like to buy it.`,
    fr: `Bonjour, j’ai vu sur votre site que l’œuvre « ${titulo} » est encore disponible. J’aimerais l’acheter.`,
  };
  const msg = encodeURIComponent(
    messages[language]
  );
  return `https://wa.me/${WA}?text=${msg}`;
}

function getObraPhotos(obra: Obra): string[] {
  const photoKeys = [
    "imagemUrl",
    "imagemUrl2",
    "imagemUrl3",
    "imagemUrl4",
    "imagemUrl5",
    "imagemUrl6",
    "imagemUrl7",
    "imagemUrl8",
    "imagemUrl9",
    "imagemUrl10",
  ] as const;
  return photoKeys
    .map((key) => obra[key])
    .filter((url): url is string => Boolean(url));
}

function ObraModal({ obra, onClose, globalDesconto }: { obra: Obra; onClose: () => void; globalDesconto: number }) {
  const { t, language } = useLanguage();
  const photos = getObraPhotos(obra);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [frameRatio, setFrameRatio] = useState(4 / 3);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const pinchPointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const fullscreenFrameRef = useRef<HTMLDivElement>(null);
  const fullscreenImageRef = useRef<HTMLImageElement>(null);
  const backgroundCloseTimer = useRef<number | null>(null);
  const effectiveDesconto = getEffectiveDesconto(obra, globalDesconto);

  useEffect(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (fullscreenImageRef.current) {
      fullscreenImageRef.current.style.transform = "translate3d(0, 0, 0) scale(1)";
    }
  }, [photoIdx, fullscreenOpen]);

  useEffect(() => {
    return () => {
      if (backgroundCloseTimer.current !== null) {
        window.clearTimeout(backgroundCloseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSizes = photos.map(
      (src) =>
        new Promise<{ width: number; height: number } | null>((resolve) => {
          const image = new window.Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => resolve(null);
          image.src = src;
        }),
    );
    Promise.all(loadSizes).then((sizes) => {
      if (cancelled) return;
      const largest = sizes
        .filter((size): size is { width: number; height: number } => Boolean(size?.width && size?.height))
        .sort((a, b) => b.width * b.height - a.width * a.height)[0];
      if (largest) setFrameRatio(largest.width / largest.height);
    });
    return () => {
      cancelled = true;
    };
  }, [obra.id]);

  const prev = () => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setPhotoIdx((i) => (i + 1) % photos.length);

  function handleSwipeStart(e: React.PointerEvent<HTMLElement>) {
    if (photos.length < 2) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    touchStartX.current = e.clientX;
    didSwipe.current = false;
  }

  function handleSwipeEnd(e: React.PointerEvent<HTMLElement>) {
    if (touchStartX.current === null || photos.length < 2) return;
    const delta = e.clientX - touchStartX.current;
    if (Math.abs(delta) >= 48) {
      didSwipe.current = true;
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  function cancelSwipe() {
    touchStartX.current = null;
  }

  function clampZoom(value: number) {
    return Math.min(4, Math.max(1, Number(value.toFixed(2))));
  }

  function clampPan(next: { x: number; y: number }, scale = zoomRef.current) {
    const frame = fullscreenFrameRef.current;
    const image = fullscreenImageRef.current;
    const frameWidth = frame?.clientWidth ?? window.innerWidth;
    const frameHeight = frame?.clientHeight ?? window.innerHeight;
    const imageWidth = image?.offsetWidth ?? frameWidth;
    const imageHeight = image?.offsetHeight ?? frameHeight;
    const maxX = Math.max(0, (imageWidth * scale - frameWidth) / 2);
    const maxY = Math.max(0, (imageHeight * scale - frameHeight) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function applyTransform(nextZoom: number, nextPan: { x: number; y: number }, commit = false) {
    const next = clampZoom(nextZoom);
    const constrainedPan = clampPan(nextPan, next);
    zoomRef.current = next;
    panRef.current = constrainedPan;
    if (fullscreenImageRef.current) {
      fullscreenImageRef.current.style.transform =
        `translate3d(${constrainedPan.x}px, ${constrainedPan.y}px, 0) scale(${next})`;
    }
    if (commit) {
      setZoom(next);
      setPan(constrainedPan);
    }
  }

  function pointerDistance() {
    const points = Array.from(pinchPointers.current.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  function handleFullscreenPointerDown(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pinchPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);

    if (pinchPointers.current.size === 2) {
      pinchStartDistance.current = pointerDistance();
      pinchStartZoom.current = zoomRef.current;
      panStart.current = null;
      touchStartX.current = null;
      didSwipe.current = true;
      return;
    }

    if (zoomRef.current > 1) {
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
    } else {
      handleSwipeStart(e);
    }
  }

  function handleFullscreenPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (!pinchPointers.current.has(e.pointerId)) return;
    pinchPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchStartDistance.current) {
      e.preventDefault();
      applyTransform(
        pinchStartZoom.current * (pointerDistance() / pinchStartDistance.current),
        panRef.current,
      );
    } else if (zoomRef.current > 1 && panStart.current) {
      e.preventDefault();
      applyTransform(zoomRef.current, {
        x: panStart.current.panX + e.clientX - panStart.current.x,
        y: panStart.current.panY + e.clientY - panStart.current.y,
      });
    }
  }

  function handleFullscreenPointerUp(e: React.PointerEvent<HTMLElement>) {
    const wasPinching = pinchPointers.current.size >= 2 || pinchStartDistance.current !== null;
    pinchPointers.current.delete(e.pointerId);
    if (pinchPointers.current.size < 2) pinchStartDistance.current = null;
    if (wasPinching) {
      setZoom(zoomRef.current);
      setPan(panRef.current);
      panStart.current = null;
      touchStartX.current = null;
      didSwipe.current = true;
      return;
    }
    if (zoomRef.current > 1) {
      setZoom(zoomRef.current);
      setPan(panRef.current);
      panStart.current = null;
      touchStartX.current = null;
      didSwipe.current = true;
    } else {
      handleSwipeEnd(e);
    }
  }

  function handleFullscreenWheel(e: React.WheelEvent<HTMLElement>) {
    e.preventDefault();
    applyTransform(zoomRef.current - e.deltaY * 0.002, panRef.current, true);
  }

  function toggleZoom() {
    applyTransform(zoomRef.current > 1 ? 1 : 2, panRef.current, true);
  }

  function handleFullscreenClick(e: React.MouseEvent<HTMLElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.detail > 1 || didSwipe.current) {
      if (backgroundCloseTimer.current !== null) {
        window.clearTimeout(backgroundCloseTimer.current);
        backgroundCloseTimer.current = null;
      }
      didSwipe.current = false;
      return;
    }
    backgroundCloseTimer.current = window.setTimeout(() => {
      setFullscreenOpen(false);
      backgroundCloseTimer.current = null;
    }, 220);
  }

  function handleImageClick() {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    setFullscreenOpen(true);
  }

  return (
    <DialogContent
      hideClose
      onPointerDownOutside={(event) => {
        if (fullscreenOpen) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (fullscreenOpen) event.preventDefault();
      }}
      onFocusOutside={(event) => {
        if (fullscreenOpen) event.preventDefault();
      }}
      style={{
        "--background": "208 100% 97%",
        "--foreground": "222 47% 11%",
        "--border": "208 30% 84%",
        "--ring": "199 89% 48%",
        "--primary": "199 89% 42%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "208 48% 92%",
        "--secondary-foreground": "222 47% 11%",
        "--muted": "208 42% 93%",
        "--muted-foreground": "215 20% 40%",
        "--accent": "199 89% 42%",
        "--accent-foreground": "0 0% 100%",
      } as React.CSSProperties}
      className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[1180px] rounded-xl border-sky-200 bg-background p-0 overflow-hidden max-h-[calc(100dvh-1rem)] flex flex-col shadow-2xl"
      aria-describedby={undefined}
    >
      <DialogTitle className="sr-only">{obra.titulo}</DialogTitle>
      <button
        onClick={onClose}
        data-testid="button-close-obra"
        className="absolute top-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-foreground transition-colors hover:bg-secondary"
        aria-label={t("common.close")}
      >
        <X size={18} />
      </button>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Galeria de fotos */}
        <div className="w-full flex-shrink-0 bg-[#08263f] md:w-[58%]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 pr-14 text-[10px] uppercase tracking-[0.24em] text-white/65 sm:pr-4">
            <span>Somakwendje</span>
            <span>{String(obra.id).padStart(2, "0")} / {photos.length || 1}</span>
          </div>
          {photos.length > 0 ? (
            <div
              className="relative w-full max-h-[43dvh] md:max-h-[62vh] touch-pan-y select-none"
              style={{ aspectRatio: frameRatio }}
              onPointerDown={handleSwipeStart}
              onPointerUp={handleSwipeEnd}
              onPointerCancel={cancelSwipe}
            >
              <img
                src={photos[photoIdx]}
                alt={obra.titulo}
                onClick={handleImageClick}
                draggable={false}
                className="w-full h-full object-contain p-4 md:p-8 cursor-zoom-in select-none pointer-events-auto transition-transform duration-500"
              />
              {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      data-testid={`button-photo-${i}`}
                      className={`h-1.5 transition-all ${i === photoIdx ? "w-8 bg-primary" : "w-2 bg-white/45 hover:bg-white/75"}`}
                      aria-label={`${t("gallery.photoOf")} ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[34dvh] min-h-[220px] max-h-[360px] flex items-center justify-center bg-[#0d3555] md:h-[62vh] md:max-h-[640px]">
        <span className="break-words px-6 text-center font-serif text-2xl text-sky-200 [overflow-wrap:anywhere]">{obra.titulo}</span>
            </div>
          )}

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto overscroll-contain border-t border-white/10 bg-[#061c30] p-3">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  data-testid={`button-thumbnail-${i}`}
                  className={`flex-shrink-0 w-14 h-14 overflow-hidden transition-opacity ${
                    i === photoIdx ? "opacity-100" : "opacity-50 hover:opacity-90"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="flex w-full min-h-0 flex-col gap-7 overflow-y-auto px-6 py-7 text-foreground md:w-[42%] md:px-9 md:py-9">
          <div className="border-b border-border pb-6">
            <p className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              <span className={`inline-block h-2 w-2 rounded-full ${obra.status === "disponivel" ? "bg-primary" : "bg-muted-foreground"}`} />
              {obra.status === "disponivel" ? t("common.available") : t("common.soldFemale")}
              {obra.categoria && ` / ${getCategoryLabel(obra.categoria, t)}`}
            </p>
            <h2 className="max-w-[15ch] font-serif text-4xl leading-[0.96] text-foreground md:text-[3.15rem]">{obra.titulo}</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-5 border-b border-border pb-7">
            {obra.tecnica && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("gallery.technique")}</p>
                <p className="text-sm text-foreground">{obra.tecnica}</p>
              </div>
            )}

            {obra.categoria && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("gallery.category")}</p>
                <p className="text-sm text-foreground">{getCategoryLabel(obra.categoria, t)}</p>
              </div>
            )}

            {obra.dimensoes && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("gallery.dimensions")}</p>
                <p className="text-sm text-foreground">{obra.dimensoes}</p>
              </div>
            )}
          </div>

          {obra.status === "disponivel" && obra.preco && (
            <div className="border-b border-border pb-7">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("gallery.price")}</p>
              {effectiveDesconto > 0 ? (() => {
                const num = parsePrecoNum(obra.preco);
                const discountedNum = num != null ? num * (1 - effectiveDesconto / 100) : null;
                return (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-xl font-medium text-foreground">
                      {discountedNum != null ? formatPreco(discountedNum) : formatObraPreco(obra.preco)}
                    </p>
                    <p className="text-sm text-muted-foreground line-through">{formatObraPreco(obra.preco)}</p>
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary">-{effectiveDesconto}% {t("gallery.discount")}</span>
                  </div>
                );
              })() : (
                <p className="text-xl font-medium text-foreground">{formatObraPreco(obra.preco)}</p>
              )}
            </div>
          )}

          {obra.descricao && (
            <div className="max-w-[38ch]">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("common.description")}</p>
              <p className="text-sm leading-[1.7] text-foreground/80">{obra.descricao}</p>
            </div>
          )}

          <div className="mt-auto pt-4">
            {obra.status === "disponivel" ? (
              <a
                href={buildWA(obra.titulo, language)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-purchase-obra"
                className="group flex w-full items-center justify-between rounded-md bg-primary px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("gallery.moreInfo")}
                <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
              </a>
            ) : (
              <div className="flex w-full items-center justify-between rounded-md border border-border px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {t("gallery.workSold")}
                <span className="text-lg leading-none">—</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {fullscreenOpen && photos.length > 0 && createPortal(
          <div
          role="dialog"
          aria-label={`${t("gallery.enlargedImageOf")}: ${obra.titulo}`}
          aria-modal="true"
            ref={fullscreenFrameRef}
            className="fixed inset-0 z-[100] bg-[#061a2b]/[.98] p-3 sm:p-8 flex items-center justify-center overflow-hidden select-none touch-none pointer-events-auto"
            onClick={handleFullscreenClick}
            onDoubleClick={toggleZoom}
            onWheel={handleFullscreenWheel}
            onPointerDown={handleFullscreenPointerDown}
            onPointerMove={handleFullscreenPointerMove}
            onPointerUp={handleFullscreenPointerUp}
            onPointerCancel={(event) => {
              pinchPointers.current.delete(event.pointerId);
              pinchStartDistance.current = null;
              panStart.current = null;
              cancelSwipe();
            }}
        >
          <button
            type="button"
            data-testid="button-close-fullscreen"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setFullscreenOpen(false);
              }}
            className="absolute top-4 left-4 z-[120] pointer-events-auto flex h-10 w-10 items-center justify-center border border-white/20 bg-[#061a2b]/70 text-white hover:bg-sky-800/80 transition-colors"
            aria-label={t("gallery.closeEnlarged")}
          >
            <X size={22} />
          </button>
          <img
            ref={fullscreenImageRef}
            src={photos[photoIdx]}
            alt={obra.titulo}
              draggable={false}
              className={`max-w-full max-h-full object-contain select-none pointer-events-none will-change-transform ${
                zoom > 1 ? "cursor-grab" : "cursor-zoom-in"
              }`}
              style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
          />
            {photos.length > 1 && (
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 text-[11px] tracking-wide pointer-events-none">
                {photoIdx + 1} / {photos.length}
              </span>
            )}
        </div>,
        document.body,
      )}
    </DialogContent>
  );
}

export default function Galeria() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("todas");
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [globalDesconto, setGlobalDesconto] = useState(0);
  const sharedObraId = (() => {
    const value = new URLSearchParams(window.location.search).get("obra");
    if (!value || !/^\d+$/.test(value)) return null;
    return Number(value);
  })();

  useEffect(() => {
    fetch("/api/configuracoes/desconto_global")
      .then((r) => r.json())
      .then((j) => {
        const val = parseInt(j.valor ?? "");
        if (!isNaN(val) && val > 0) setGlobalDesconto(val);
      })
      .catch(() => {});
  }, []);

  const params = {
    ...(statusFilter === "todas" ? {} : { status: statusFilter }),
    ...(categoryFilter === "todas" ? {} : { categoria: categoryFilter }),
  };

  const { data: obras, isLoading } = useListObras(
    Object.keys(params).length > 0 ? params : undefined
  );
  const { data: sharedObra } = useGetObra(sharedObraId ?? 0, {
    query: { enabled: sharedObraId != null, queryKey: getGetObraQueryKey(sharedObraId ?? 0) },
  });

  useEffect(() => {
    if (selectedObra || sharedObraId == null) return;
    const obra = sharedObra ?? obras?.find((item) => item.id === sharedObraId);
    if (obra) setSelectedObra(obra);
  }, [obras, selectedObra, sharedObra, sharedObraId]);

  function closeSelectedObra() {
    const url = new URL(window.location.href);
    url.searchParams.delete("obra");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setSelectedObra(null);
  }

  const filteredObras = obras ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar fixed={false} />
      <main>
        <section className="sticky top-0 z-40 bg-background/95 px-4 py-3 backdrop-blur-md md:px-6">
          <div className="mx-auto max-w-6xl space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-8">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-[4.5rem] shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t("gallery.state")}</span>
                <div className="flex min-w-0 gap-2 overflow-x-auto whitespace-nowrap" role="group" aria-label={t("gallery.state")}>
                  {(["disponivel", "vendido"] as const).map((filter) => {
                    const active = statusFilter === filter;
                    const label = filter === "disponivel"
                      ? t("common.availablePlural")
                      : t("common.soldPlural");
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setStatusFilter((current) => current === filter ? "todas" : filter)}
                        aria-pressed={active}
                        data-testid={`filter-status-${filter}`}
                        className={`rounded-full px-3 py-1.5 text-[10px] transition-colors sm:text-xs ${
                          active
                            ? "bg-[#f8f6f2] text-foreground shadow-sm"
                            : "bg-white/55 text-foreground hover:bg-primary/10"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center">
                <span className="w-[4.5rem] shrink-0 pt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:pt-0">{t("gallery.category")}</span>
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label={t("gallery.category")}>
                  {categoryOptions.map(({ value, label }) => {
                    const active = categoryFilter === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategoryFilter((current) => current === value ? "todas" : value)}
                        aria-pressed={active}
                        data-testid={`filter-category-${value}`}
                        className={`min-h-8 min-w-0 rounded-full px-2 py-1.5 text-left text-[10px] leading-tight transition-colors sm:px-3 sm:text-xs sm:whitespace-nowrap ${
                          active
                            ? "bg-[#f8f6f2] text-foreground shadow-sm"
                            : "bg-white/55 text-foreground hover:bg-primary/10"
                        }`}
                      >
                        {t(label)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-[1.75rem]" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredObras.length > 0 ? (
            <div className="grid auto-rows-fr grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-10">
              {filteredObras.map((obra, index) => {
                const pairShape = artworkPairShapes[index % artworkPairShapes.length];
                const imageEdgeClass = index % 2 === 0
                  ? "-mr-3 w-[calc(100%+0.75rem)] sm:-mr-4 sm:w-[calc(100%+1rem)]"
                  : "-ml-3 w-[calc(100%+0.75rem)] sm:-ml-4 sm:w-[calc(100%+1rem)]";
                return (
                <article
                  key={obra.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#f8f6f2] p-3 shadow-[0_8px_22px_rgba(20,80,115,0.06)] sm:p-4"
                  data-testid={`card-obra-${obra.id}`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedObra(obra)}
                    aria-label={`${t("gallery.detailsOf")} ${obra.titulo}`}
                    data-testid={`button-image-${obra.id}`}
                    className={`${imageEdgeClass} relative isolate block aspect-square shrink-0 bg-transparent text-left`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 z-0 bg-[#c8dbe5]"
                      style={{ borderRadius: pairShape }}
                    />
                    {obra.imagemUrl ? (
                      <img
                        src={obra.imagemUrl}
                        alt={obra.titulo}
                        className="relative z-10 h-full w-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.025] sm:p-3 md:p-4"
                      />
                    ) : (
                      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
                        <span className="px-4 text-center font-serif text-xl text-foreground">{obra.titulo}</span>
                      </div>
                    )}
                    <span className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-foreground">
                      {obra.status === "disponivel" ? t("common.available") : t("common.soldFemale")}
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                      <h2 className="break-words font-serif text-lg leading-tight text-foreground [overflow-wrap:anywhere] sm:text-2xl">{obra.titulo}</h2>
                      {obra.tecnica && (
                        <p className="mt-1 text-xs text-muted-foreground">{obra.tecnica}</p>
                      )}
                      {obra.categoria && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {getCategoryLabel(obra.categoria, t)}
                        </p>
                      )}
                      </div>
                      {obra.status === "disponivel" && obra.preco && (() => {
                        const discount = getEffectiveDesconto(obra, globalDesconto);
                        const price = parsePrecoNum(obra.preco);
                        return (
                          <div className="shrink-0 pt-1 text-right">
                            {discount > 0 && price != null ? (
                              <>
                                <p className="text-sm font-medium text-foreground">{formatPreco(price * (1 - discount / 100))}</p>
                                <p className="text-xs text-muted-foreground line-through">{formatObraPreco(obra.preco)}</p>
                              </>
                            ) : (
                              <p className="text-sm font-medium text-foreground">{formatObraPreco(obra.preco)}</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {obra.descricao && (
                      <p className="mt-3 px-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {obra.descricao}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedObra(obra)}
                      data-testid={`button-ver-${obra.id}`}
                      className="mt-auto inline-flex items-center px-1 pt-4 text-xs uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
                    >
                      {t("common.view")}
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-serif text-2xl text-muted-foreground">{t("gallery.noWorks")}</p>
            </div>
          )}
        </section>
      </main>
      <Footer />

      <Dialog open={!!selectedObra} onOpenChange={(open) => !open && closeSelectedObra()}>
        {selectedObra && (
          <ObraModal obra={selectedObra} onClose={closeSelectedObra} globalDesconto={globalDesconto} />
        )}
      </Dialog>
    </div>
  );
}
