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
      className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[1180px] rounded-none border-[#b5b7aa] bg-[#eee9df] p-0 overflow-hidden max-h-[calc(100dvh-1rem)] flex flex-col shadow-[0_24px_80px_rgba(25,34,31,0.24)]"
      aria-describedby={undefined}
    >
      <DialogTitle className="sr-only">{obra.titulo}</DialogTitle>
      <button
        onClick={onClose}
        data-testid="button-close-obra"
        className="absolute top-3 right-3 z-30 flex h-9 w-9 items-center justify-center border border-[#c9c7bc] bg-[#eee9df]/90 text-[#202c29] transition-colors hover:bg-[#f7f4ed]"
        aria-label={t("common.close")}
      >
        <X size={18} />
      </button>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Galeria de fotos */}
        <div className="w-full md:w-[58%] flex-shrink-0 bg-[#202a27]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-[#c3c6b8]">
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
                      className={`h-1.5 transition-all ${i === photoIdx ? "w-8 bg-[#e4a36d]" : "w-2 bg-white/45 hover:bg-white/75"}`}
                      aria-label={`${t("gallery.photoOf")} ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[34dvh] min-h-[220px] max-h-[360px] md:h-[62vh] md:max-h-[640px] flex items-center justify-center bg-[#293532]">
              <span className="font-serif text-[#e4a36d] text-2xl px-6 text-center">{obra.titulo}</span>
            </div>
          )}

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 border-t border-white/10 bg-[#1a2321] p-3 overflow-x-auto overscroll-contain">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  data-testid={`button-thumbnail-${i}`}
                  className={`flex-shrink-0 w-14 h-14 overflow-hidden border transition-colors ${
                    i === photoIdx ? "border-[#e4a36d]" : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="w-full md:w-[42%] min-h-0 overflow-y-auto px-6 py-7 md:px-10 md:py-10 flex flex-col gap-7 text-[#202c29]">
          <div className="border-b border-[#c9c7bc] pb-6">
            <p className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#778078]">
              <span className={`inline-block h-2 w-2 rounded-full ${obra.status === "disponivel" ? "bg-[#b35b3e]" : "bg-[#9b9b91]"}`} />
              {obra.status === "disponivel" ? t("common.available") : t("common.soldFemale")}
              {obra.tamanho && obra.tamanho !== "media" && ` / ${obra.tamanho === "grande" ? t("common.large") : t("common.small")}`}
            </p>
            <h2 className="max-w-[15ch] font-serif text-4xl leading-[0.96] text-[#202c29] md:text-[3.15rem]">{obra.titulo}</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-5 border-b border-[#c9c7bc] pb-7">
            {obra.tecnica && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#778078]">{t("gallery.technique")}</p>
                <p className="text-sm text-[#202c29]">{obra.tecnica}</p>
              </div>
            )}

            {obra.tamanho && obra.tamanho !== "media" && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#778078]">{t("gallery.size")}</p>
                <p className="text-sm text-[#202c29]">{obra.tamanho === "grande" ? "Grande" : "Pequena"}</p>
              </div>
            )}

            {obra.dimensoes && (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#778078]">{t("gallery.dimensions")}</p>
                <p className="text-sm text-[#202c29]">{obra.dimensoes}</p>
              </div>
            )}
          </div>

          {obra.status === "disponivel" && obra.preco && (
            <div className="border-b border-[#c9c7bc] pb-7">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#778078]">{t("gallery.price")}</p>
              {effectiveDesconto > 0 ? (() => {
                const num = parsePrecoNum(obra.preco);
                const discountedNum = num != null ? num * (1 - effectiveDesconto / 100) : null;
                return (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-xl font-medium text-[#202c29]">
                      {discountedNum != null ? formatPreco(discountedNum) : formatObraPreco(obra.preco)}
                    </p>
                    <p className="text-sm line-through text-[#8f938a]">{formatObraPreco(obra.preco)}</p>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#b35b3e] font-medium">-{effectiveDesconto}% {t("gallery.discount")}</span>
                  </div>
                );
              })() : (
                <p className="text-xl font-medium text-[#202c29]">{formatObraPreco(obra.preco)}</p>
              )}
            </div>
          )}

          {obra.descricao && (
            <div className="max-w-[38ch]">
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#778078]">{t("common.description")}</p>
              <p className="text-sm leading-[1.7] text-[#394540]">{obra.descricao}</p>
            </div>
          )}

          <div className="mt-auto pt-4">
            {obra.status === "disponivel" ? (
              <a
                href={buildWA(obra.titulo, language)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-purchase-obra"
                className="group flex w-full items-center justify-between border border-[#202c29] px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-[#202c29] transition-colors hover:bg-[#202c29] hover:text-[#eee9df]"
              >
                {t("gallery.moreInfo")}
                <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
              </a>
            ) : (
              <div className="flex w-full items-center justify-between border border-[#c9c7bc] px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-[#8b8f86]">
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
            className="fixed inset-0 z-[100] bg-[#101615]/[.98] p-3 sm:p-8 flex items-center justify-center overflow-hidden select-none touch-none pointer-events-auto"
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
            className="absolute top-4 left-4 z-[120] pointer-events-auto flex h-10 w-10 items-center justify-center border border-white/20 bg-[#101615]/70 text-white hover:bg-white/15 transition-colors"
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
    <div className="min-h-screen bg-[#f4f0e7] text-[#202c29]">
      <Navbar />
      <div className="pt-[4.5rem]">
        {/* Header */}
        <section className="border-b border-[#c9c7bc] px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[minmax(0,1fr)_15rem] md:items-end lg:gap-20">
            <div>
              <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-[#b35b3e]">Somakwendje / archive 01</p>
              <h1 className="max-w-[9ch] font-serif text-[clamp(4.5rem,13vw,11.5rem)] leading-[0.78] tracking-[-0.055em] text-[#202c29]">
                {t("gallery.title")}
              </h1>
            </div>
            <div className="border-l border-[#c9c7bc] pl-5 text-[#65736c] md:mb-2">
              <p className="mb-6 text-[10px] uppercase tracking-[0.24em] text-[#202c29]">01—∞</p>
              <p className="max-w-[18ch] text-sm leading-[1.65]">
                {t("gallery.state")} / {t("gallery.size")}
              </p>
              <div className="mt-8 h-px w-14 bg-[#b35b3e]" />
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="sticky top-[4.5rem] z-40 border-b border-[#c9c7bc] bg-[#f4f0e7]/95 px-5 py-4 backdrop-blur-md md:px-10">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Estado */}
            <div className="flex items-center gap-4">
              <span className="w-16 shrink-0 text-[10px] uppercase tracking-[0.24em] text-[#778078]">{t("gallery.state")}</span>
              <div className="flex gap-1.5">
                {(["disponivel", "vendido"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(statusFilter === f ? "todas" : f)}
                    data-testid={`filter-status-${f}`}
                    className={`border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                      statusFilter === f
                        ? "border-[#202c29] bg-[#202c29] text-[#f4f0e7]"
                        : "border-[#c9c7bc] text-[#778078] hover:border-[#202c29] hover:text-[#202c29]"
                    }`}
                  >
                    {f === "disponivel" ? t("common.availablePlural") : t("common.soldPlural")}
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho */}
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[10px] uppercase tracking-[0.24em] text-[#778078]">{t("gallery.size")}</span>
              <div className="flex gap-1.5">
                {(["grande", "pequena"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTamanhoFilter(tamanhoFilter === f ? "todos" : f)}
                    data-testid={`filter-size-${f}`}
                    className={`border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                      tamanhoFilter === f
                        ? "border-[#202c29] bg-[#202c29] text-[#f4f0e7]"
                        : "border-[#c9c7bc] text-[#778078] hover:border-[#202c29] hover:text-[#202c29]"
                    }`}
                  >
                    {f === "grande" ? t("common.largePlural") : t("common.smallPlural")}
                  </button>
                ))}
              </div>
            </div>


          </div>
        </div>

        {/* Archive list */}
        <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-10 md:py-16">
          {isLoading ? (
            <div className="space-y-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid gap-6 border-b border-[#d7d2c7] pb-10 md:grid-cols-12 md:gap-10">
                  <Skeleton className="aspect-[4/3] w-full rounded-none bg-[#e5dfd4] md:col-span-7" />
                  <div className="space-y-3 md:col-span-5 md:pt-4">
                    <Skeleton className="h-3 w-16 rounded-none bg-[#e5dfd4]" />
                    <Skeleton className="h-10 w-3/4 rounded-none bg-[#e5dfd4]" />
                    <Skeleton className="h-3 w-1/2 rounded-none bg-[#e5dfd4]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredObras.length > 0 ? (
            <div className="divide-y divide-[#d1cdc2]">
              {filteredObras.map((obra) => (
                <article
                  key={obra.id}
                  className="group grid gap-7 py-10 first:pt-2 md:grid-cols-12 md:gap-10 md:py-16 lg:gap-16"
                  data-testid={`card-obra-${obra.id}`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedObra(obra)}
                    aria-label={`${t("gallery.detailsOf")} ${obra.titulo}`}
                    data-testid={`button-image-${obra.id}`}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-[#ded8ca] text-left md:col-span-7 lg:col-span-7"
                  >
                    {obra.imagemUrl ? (
                      <img
                        src={obra.imagemUrl}
                        alt={obra.titulo}
                        className="h-full w-full object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.025] md:p-6"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#d3cbbb]">
                        <span className="px-4 text-center font-serif text-xl text-[#65736c]">{obra.titulo}</span>
                      </div>
                    )}
                    <span className="absolute left-4 top-4 text-[10px] tracking-[0.2em] text-[#202c29]/70">
                      {String(obra.id).padStart(2, "0")}
                    </span>
                      {obra.status === "vendido" && (
                      <div className="absolute bottom-4 left-4 bg-[#202c29] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f4f0e7]">
                        {t("common.soldFemale")}
                      </div>
                      )}
                  </button>
                  <div className="flex flex-col justify-between md:col-span-5 md:py-2">
                    <div>
                      <div className="mb-5 flex items-center justify-between border-b border-[#d1cdc2] pb-3 text-[10px] uppercase tracking-[0.2em] text-[#778078]">
                        <span>{obra.status === "disponivel" ? t("common.available") : t("common.sold")}</span>
                        {obra.tamanho && obra.tamanho !== "media" && (
                          <span>{obra.tamanho === "grande" ? t("common.large") : t("common.small")}</span>
                        )}
                      </div>
                      <h2 className="max-w-[10ch] font-serif text-4xl leading-[0.92] tracking-[-0.035em] text-[#202c29] md:text-5xl lg:text-6xl">{obra.titulo}</h2>
                      {obra.tecnica && (
                        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#778078]">{obra.tecnica}</p>
                      )}
                    </div>
                    <div className="mt-8">
                      {obra.status === "disponivel" && obra.preco && (() => {
                        const eff = getEffectiveDesconto(obra, globalDesconto);
                        if (eff > 0) {
                          const num = parsePrecoNum(obra.preco);
                          const discounted = num != null ? num * (1 - eff / 100) : null;
                          return (
                            <div className="mb-5 flex items-baseline gap-2 flex-wrap">
                              <p className="text-sm font-medium text-[#202c29]">{discounted != null ? formatPreco(discounted) : formatObraPreco(obra.preco)}</p>
                              <p className="text-xs line-through text-[#8f938a]">{formatObraPreco(obra.preco)}</p>
                              <span className="text-[10px] uppercase tracking-[0.12em] text-[#b35b3e]">-{eff}%</span>
                            </div>
                          );
                        }
                        return <p className="mb-5 text-sm font-medium text-[#202c29]">{formatObraPreco(obra.preco)}</p>;
                      })()}
                      {obra.descricao && (
                        <p className="mb-5 max-w-[32ch] text-sm leading-[1.55] text-[#65736c] line-clamp-2">{obra.descricao}</p>
                      )}
                      <button
                        onClick={() => setSelectedObra(obra)}
                        data-testid={`button-ver-${obra.id}`}
                        className="group/link inline-flex items-center gap-4 border-b border-[#202c29] pb-2 text-[10px] uppercase tracking-[0.2em] text-[#202c29] transition-colors hover:border-[#b35b3e] hover:text-[#b35b3e]"
                      >
                        {t("common.view")}
                        <span className="text-base leading-none transition-transform group-hover/link:translate-x-1">→</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-y border-[#c9c7bc] py-28 text-center">
               <p className="font-serif text-4xl tracking-[-0.03em] text-[#65736c]">{t("gallery.noWorks")}</p>
              <button
                onClick={() => { setStatusFilter("todas"); setTamanhoFilter("todos"); }}
                data-testid="button-see-all"
                className="mt-7 border-b border-[#b35b3e] pb-1 text-[10px] uppercase tracking-[0.2em] text-[#b35b3e]"
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
