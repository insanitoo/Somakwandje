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
type TamanhoFilter = "todos" | "grande" | "pequena";

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

const WA = "244934959424";

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
    setZoom(1);
    setPan({ x: 0, y: 0 });
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

  function clampPan(next: { x: number; y: number }, scale = zoom) {
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

  function updateZoom(nextZoom: number) {
    const next = clampZoom(nextZoom);
    setZoom(next);
    setPan((current) => clampPan(current, next));
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
      pinchStartZoom.current = zoom;
      panStart.current = null;
      touchStartX.current = null;
      didSwipe.current = true;
      return;
    }

    if (zoom > 1) {
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    } else {
      handleSwipeStart(e);
    }
  }

  function handleFullscreenPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (!pinchPointers.current.has(e.pointerId)) return;
    pinchPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchStartDistance.current) {
      e.preventDefault();
      updateZoom(pinchStartZoom.current * (pointerDistance() / pinchStartDistance.current));
    } else if (zoom > 1 && panStart.current) {
      e.preventDefault();
      setPan(clampPan({
        x: panStart.current.panX + e.clientX - panStart.current.x,
        y: panStart.current.panY + e.clientY - panStart.current.y,
      }));
    }
  }

  function handleFullscreenPointerUp(e: React.PointerEvent<HTMLElement>) {
    const wasPinching = pinchPointers.current.size >= 2 || pinchStartDistance.current !== null;
    pinchPointers.current.delete(e.pointerId);
    if (pinchPointers.current.size < 2) pinchStartDistance.current = null;
    if (wasPinching) {
      panStart.current = null;
      touchStartX.current = null;
      didSwipe.current = true;
      return;
    }
    if (zoom > 1) {
      panStart.current = null;
      touchStartX.current = null;
      didSwipe.current = true;
    } else {
      handleSwipeEnd(e);
    }
  }

  function handleFullscreenWheel(e: React.WheelEvent<HTMLElement>) {
    e.preventDefault();
    updateZoom(zoom - e.deltaY * 0.002);
  }

  function toggleZoom() {
    updateZoom(zoom > 1 ? 1 : 2);
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
      className="w-[calc(100%-1rem)] max-w-4xl rounded-none p-0 overflow-hidden max-h-[calc(100dvh-1rem)] flex flex-col"
      aria-describedby={undefined}
    >
      <DialogTitle className="sr-only">{obra.titulo}</DialogTitle>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-20 p-2 bg-white/85 hover:bg-white rounded-full text-foreground shadow-sm"
        aria-label={t("common.close")}
      >
        <X size={18} />
      </button>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Galeria de fotos */}
        <div className="w-full md:w-1/2 flex-shrink-0 bg-[hsl(40,43%,96%)]">
          {photos.length > 0 ? (
            <div
              className="relative w-full max-h-[44dvh] md:max-h-[66vh] touch-pan-y select-none"
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
                className="w-full h-full object-contain p-1 cursor-zoom-in select-none pointer-events-auto"
              />
              {photos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === photoIdx ? "bg-white" : "bg-white/50"}`}
                      aria-label={`${t("gallery.photoOf")} ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[34dvh] min-h-[220px] max-h-[360px] md:h-[66vh] md:max-h-[640px] flex items-center justify-center bg-primary/10">
              <span className="font-serif text-primary text-lg px-6 text-center">{obra.titulo}</span>
            </div>
          )}

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 p-2 bg-white border-t border-border overflow-x-auto overscroll-contain">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className={`flex-shrink-0 w-14 h-14 overflow-hidden border-2 transition-colors ${
                    i === photoIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="w-full md:w-1/2 min-h-0 overflow-y-auto p-5 md:p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
              {obra.status === "disponivel" ? t("common.available") : t("common.soldFemale")}
              {obra.tamanho && obra.tamanho !== "media" && ` · ${obra.tamanho === "grande" ? t("common.large") : t("common.small")}`}
            </p>
            <h2 className="font-serif text-2xl text-foreground">{obra.titulo}</h2>
          </div>

          {obra.tecnica && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">{t("gallery.technique")}</p>
              <p className="text-sm text-foreground">{obra.tecnica}</p>
            </div>
          )}

          {obra.tamanho && obra.tamanho !== "media" && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">{t("gallery.size")}</p>
              <p className="text-sm text-foreground">{obra.tamanho === "grande" ? "Grande" : "Pequena"}</p>
            </div>
          )}

          {obra.dimensoes && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">{t("gallery.dimensions")}</p>
              <p className="text-sm text-foreground">{obra.dimensoes}</p>
            </div>
          )}

          {obra.status === "disponivel" && obra.preco && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">{t("gallery.price")}</p>
              {effectiveDesconto > 0 ? (() => {
                const num = parsePrecoNum(obra.preco);
                const discountedNum = num != null ? num * (1 - effectiveDesconto / 100) : null;
                return (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-base font-medium text-foreground">
                      {discountedNum != null ? formatPreco(discountedNum) : formatObraPreco(obra.preco)}
                    </p>
                    <p className="text-sm line-through text-muted-foreground">{formatObraPreco(obra.preco)}</p>
                    <span className="text-xs text-green-700 font-medium">-{effectiveDesconto}% {t("gallery.discount")}</span>
                  </div>
                );
              })() : (
                <p className="text-base font-medium text-foreground">{formatObraPreco(obra.preco)}</p>
              )}
            </div>
          )}

          {obra.descricao && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">{t("common.description")}</p>
              <p className="text-sm text-foreground leading-relaxed">{obra.descricao}</p>
            </div>
          )}

          <div className="mt-auto pt-4">
            {obra.status === "disponivel" ? (
              <a
                href={buildWA(obra.titulo, language)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
              >
                {t("gallery.moreInfo")}
              </a>
            ) : (
              <div className="w-full flex items-center justify-center px-6 py-3 bg-muted text-muted-foreground text-xs tracking-widest uppercase">
                {t("gallery.workSold")}
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
            className="fixed inset-0 z-[100] bg-black/95 p-3 sm:p-8 flex items-center justify-center overflow-hidden select-none touch-none pointer-events-auto"
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
            className="absolute top-4 left-4 z-[120] pointer-events-auto p-2 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
            aria-label={t("gallery.closeEnlarged")}
          >
            <X size={22} />
          </button>
          <img
            ref={fullscreenImageRef}
            src={photos[photoIdx]}
            alt={obra.titulo}
              draggable={false}
              className={`max-w-full max-h-full object-contain select-none pointer-events-none transition-transform duration-150 ${
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
  const [tamanhoFilter, setTamanhoFilter] = useState<TamanhoFilter>("todos");
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

  const params: Record<string, string | number> = {};
  if (statusFilter !== "todas") params.status = statusFilter;
  if (tamanhoFilter !== "todos") params.tamanho = tamanhoFilter;

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-border py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2"></p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">{t("gallery.title")}</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-40 bg-[hsl(40,43%,96%)]/95 backdrop-blur-sm border-b border-border px-6 py-5">
          <div className="max-w-6xl mx-auto flex flex-col gap-3">
            {/* Estado */}
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-widest uppercase text-muted-foreground w-20 shrink-0">{t("gallery.state")}</span>
              <div className="flex gap-2">
                {(["disponivel", "vendido"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(statusFilter === f ? "todas" : f)}
                    className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors ${
                      statusFilter === f
                        ? "bg-primary text-white"
                        : "bg-white border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "disponivel" ? t("common.availablePlural") : t("common.soldPlural")}
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho */}
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-widest uppercase text-muted-foreground w-20 shrink-0">{t("gallery.size")}</span>
              <div className="flex gap-2">
                {(["grande", "pequena"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTamanhoFilter(tamanhoFilter === f ? "todos" : f)}
                    className={`px-3 py-1 text-xs tracking-widest uppercase transition-colors ${
                      tamanhoFilter === f
                        ? "bg-primary text-white"
                        : "bg-white border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "grande" ? t("common.largePlural") : t("common.smallPlural")}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square" />
                  <Skeleton className="h-4 mt-2 w-3/4" />
                  <Skeleton className="h-3 mt-1 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredObras.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredObras.map((obra) => (
                <div key={obra.id} className="group bg-card border border-card-border overflow-hidden" data-testid={`card-obra-${obra.id}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedObra(obra)}
                      aria-label={`${t("gallery.detailsOf")} ${obra.titulo}`}
                      className="block w-full text-left aspect-square overflow-hidden bg-primary/10 relative"
                    >
                    {obra.imagemUrl ? (
                      <img
                        src={obra.imagemUrl}
                        alt={obra.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20">
                        <span className="font-serif text-primary text-sm px-4 text-center">{obra.titulo}</span>
                      </div>
                    )}
                      {obra.status === "vendido" && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs tracking-wide">
                          {t("common.soldFemale")}
                        </div>
                      )}
                    </button>
                  <div className="p-4">
                    <p className="font-serif text-base text-foreground leading-tight">{obra.titulo}</p>
                    {obra.tecnica && (
                      <p className="text-xs text-muted-foreground mt-0.5">{obra.tecnica}</p>
                    )}
                    {obra.status === "disponivel" && obra.preco && (() => {
                      const eff = getEffectiveDesconto(obra, globalDesconto);
                      if (eff > 0) {
                        const num = parsePrecoNum(obra.preco);
                        const discounted = num != null ? num * (1 - eff / 100) : null;
                        return (
                          <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                            <p className="text-xs font-medium text-foreground">{discounted != null ? formatPreco(discounted) : formatObraPreco(obra.preco)}</p>
                            <p className="text-xs line-through text-muted-foreground">{formatObraPreco(obra.preco)}</p>
                            <span className="text-xs text-green-700 font-medium">-{eff}%</span>
                          </div>
                        );
                      }
                      return <p className="text-xs font-medium text-foreground mt-0.5">{formatObraPreco(obra.preco)}</p>;
                    })()}
                    {obra.descricao && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{obra.descricao}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className={`text-xs flex items-center gap-1 ${obra.status === "disponivel" ? "text-primary" : "text-muted-foreground"}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${obra.status === "disponivel" ? "bg-primary" : "bg-muted-foreground"}`} />
                        {obra.status === "disponivel" ? t("common.available") : t("common.sold")}
                      </span>
                      <button
                        onClick={() => setSelectedObra(obra)}
                        data-testid={`button-ver-${obra.id}`}
                        className="text-xs px-3 py-1 border border-foreground text-foreground hover:bg-foreground hover:text-white transition-colors tracking-wide"
                      >
                         {t("common.view")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
               <p className="font-serif text-2xl text-muted-foreground">{t("gallery.noWorks")}</p>
              <button
                onClick={() => { setStatusFilter("todas"); setTamanhoFilter("todos"); }}
                className="mt-4 text-sm tracking-widest uppercase text-primary border-b border-primary pb-0.5"
              >
                 {t("gallery.seeAll")}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Modal de obra */}
      <Dialog open={!!selectedObra} onOpenChange={(o) => !o && closeSelectedObra()}>
        {selectedObra && (
            <ObraModal obra={selectedObra} onClose={closeSelectedObra} globalDesconto={globalDesconto} />
        )}
      </Dialog>
    </div>
  );
}
