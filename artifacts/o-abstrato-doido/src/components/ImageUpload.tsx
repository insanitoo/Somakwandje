import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageGalleryUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
}

function ImageGalleryUpload({ values, onChange, label = "Fotos", maxImages = 10 }: ImageGalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs tracking-widest uppercase text-foreground font-medium">{label}</p>
        <span className="text-xs text-muted-foreground">{values.length}/{maxImages}</span>
      </div>
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {values.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-square">
              <img src={url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover border border-[hsl(40,10%,85%)]" />
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-full"
                aria-label={`Remover foto ${index + 1}`}
              >
                <X size={13} />
              </button>
              {index === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white px-1.5 py-0.5 text-[10px]">Principal</span>}
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
