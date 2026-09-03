import { useRef, useState } from "react";
import { GripVertical, Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageGalleryUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
}

function ImageGalleryUpload({ values, onChange, label = "Fotos", maxImages = 10 }: ImageGalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ index: number; pointerId: number; moved: boolean; startX: number; startY: number } | null>(null);
  const dropRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
    if (!res.ok) throw new Error("Erro no upload");
    const data = await res.json();
    return data.url;
  }

  async function handleFiles(fileList: FileList | File[]) {
    const availableSlots = maxImages - values.length;
    if (availableSlots <= 0) {
      setError(`Limite de ${maxImages} imagens atingido.`);
      return;
    }

    const files = Array.from(fileList).slice(0, availableSlots);
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(files.map(uploadFile));
      const uploaded = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
        .map((result) => result.value);
      if (uploaded.length > 0) onChange([...values, ...uploaded].slice(0, maxImages));
      if (uploaded.length !== files.length) setError("Algumas imagens não puderam ser enviadas.");
    } catch {
      setError("Falha no upload. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function startReorder(index: number, e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, pointerId: e.pointerId, moved: false, startX: e.clientX, startY: e.clientY };
    setDraggingIndex(index);
    setDropIndex(index);
    dropRef.current = index;
  }

  function updateReorder(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) {
      drag.moved = true;
    }
    if (!drag.moved) return;

    e.preventDefault();
    const target = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-image-index]");
    if (!target) return;
    const targetIndex = Number(target.dataset.imageIndex);
    if (!Number.isNaN(targetIndex)) {
      dropRef.current = targetIndex;
      setDropIndex(targetIndex);
    }
  }

  function finishReorder(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const targetIndex = dropRef.current;
    if (drag.moved && targetIndex != null && targetIndex !== drag.index) {
      const next = [...values];
      const [moved] = next.splice(drag.index, 1);
      next.splice(targetIndex, 0, moved);
      onChange(next);
    }

    dragRef.current = null;
    dropRef.current = null;
    setDraggingIndex(null);
    setDropIndex(null);
  }

  function cancelReorder() {
    dragRef.current = null;
    dropRef.current = null;
    setDraggingIndex(null);
    setDropIndex(null);
  }

  function makePrincipal(index: number) {
    if (index === 0) return;
    const next = [...values];
    const [principal] = next.splice(index, 1);
    next.unshift(principal);
    onChange(next);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs tracking-widest uppercase text-foreground font-medium">{label}</p>
        <span className="text-xs text-muted-foreground">{values.length}/{maxImages}</span>
      </div>
      {values.length > 1 && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Pressione uma foto e arraste-a para mudar a ordem. A primeira foto é a principal.
        </p>
      )}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {values.map((url, index) => (
            <div
              key={`${url}-${index}`}
              data-image-index={index}
              onPointerDown={(e) => startReorder(index, e)}
              onPointerMove={updateReorder}
              onPointerUp={finishReorder}
              onPointerCancel={cancelReorder}
              className={`relative group aspect-square select-none touch-none ${
                draggingIndex === index ? "opacity-50" : ""
              } ${dropIndex === index && draggingIndex !== index ? "ring-2 ring-primary ring-offset-1" : ""}`}
            >
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                draggable={false}
                className="w-full h-full object-cover border border-[hsl(40,10%,85%)] pointer-events-none"
              />
              <span className="absolute top-1 left-1 bg-black/60 text-white p-1 pointer-events-none" aria-hidden="true">
                <GripVertical size={13} />
              </span>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 bg-black/70 text-white p-1.5 rounded-full shadow-sm"
                aria-label={`Remover foto ${index + 1}`}
              >
                <X size={13} />
              </button>
              {index === 0 ? (
                <span className="absolute bottom-1 left-1 bg-primary text-white px-1.5 py-0.5 text-[10px]">Principal</span>
              ) : (
                <button
                  type="button"
                  onClick={() => makePrincipal(index)}
                  className="absolute bottom-1 left-1 bg-black/70 text-white px-1.5 py-1 text-[10px] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label={`Tornar foto ${index + 1} principal`}
                >
                  Principal
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {values.length < maxImages && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`w-full h-28 border-2 border-dashed border-[hsl(40,10%,80%)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-foreground/40 transition-colors ${loading ? "opacity-60 pointer-events-none" : ""}`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">A enviar imagens...</p>
            </div>
          ) : (
            <>
              <ImageIcon size={22} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center px-4">
                Selecione várias imagens de uma vez ou arraste-as para aqui
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-white text-xs">
                <Upload size={12} /> Escolher imagens
              </div>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

interface SingleImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload(props: ImageGalleryUploadProps | SingleImageUploadProps) {
  if ("values" in props) {
    return <ImageGalleryUpload {...props} />;
  }

  return (
    <ImageGalleryUpload
      values={props.value ? [props.value] : []}
      onChange={(urls) => props.onChange(urls[0] ?? "")}
      label={props.label}
      maxImages={1}
    />
  );
}
