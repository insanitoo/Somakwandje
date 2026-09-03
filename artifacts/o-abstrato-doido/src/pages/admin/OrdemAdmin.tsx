import { useState, useEffect, useRef } from "react";
import { useListObras, useUpdateObra, getListObrasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, GripVertical, Star } from "lucide-react";

type ObraRow = {
  id: number;
  titulo: string;
  imagemUrl?: string | null;
  destaque: boolean;
  ordem?: number | null;
};

export default function OrdemAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: obras, isLoading } = useListObras();
  const updateObra = useUpdateObra();

  const [lista, setLista] = useState<ObraRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragRef = useRef<{ index: number; pointerId: number; startY: number } | null>(null);
  const dropRef = useRef<number | null>(null);

  useEffect(() => {
    if (!obras) return;
    const sorted = [...obras].sort((a, b) => {
      if (a.ordem != null && b.ordem != null) return a.ordem - b.ordem;
      if (a.ordem != null) return -1;
      if (b.ordem != null) return 1;
      return a.id - b.id;
    });
    setLista(sorted.map((o) => ({ id: o.id, titulo: o.titulo, imagemUrl: o.imagemUrl, destaque: o.destaque ?? false, ordem: o.ordem })));
  }, [obras]);

  function moveTo(idx: number, target: number) {
    const next = [...lista];
    if (target < 0 || target >= next.length) return;
    const [dragged] = next.splice(idx, 1);
    next.splice(target, 0, dragged);
    setLista(next);
  }

  function startDrag(index: number, e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { index, pointerId: e.pointerId, startY: e.clientY };
    setDraggedIndex(index);
    setDropIndex(index);
    dropRef.current = index;
  }

  function updateDrag(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (Math.abs(e.clientY - drag.startY) < 8) return;
    e.preventDefault();

    const target = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-order-index]");
    if (!target) return;
    const targetIndex = Number(target.dataset.orderIndex);
    if (!Number.isNaN(targetIndex)) {
      dropRef.current = targetIndex;
      setDropIndex(targetIndex);
    }
  }

  function finishDrag(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const targetIndex = dropRef.current;
    if (targetIndex != null && targetIndex !== drag.index) moveTo(drag.index, targetIndex);
    dragRef.current = null;
    dropRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
  }

  function cancelDrag() {
    dragRef.current = null;
    dropRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
  }

  function moveByButton(index: number, direction: -1 | 1) {
    moveTo(index, index + direction);
  }

  function toggleDestaque(idx: number) {
    const next = [...lista];
    next[idx] = { ...next[idx], destaque: !next[idx].destaque };
    setLista(next);
  }

  async function saveAll() {
    setSaving(true);
    try {
      // Save order
      const reorderPayload = lista.map((o, i) => ({ id: o.id, ordem: i + 1 }));
      const res = await fetch("/api/obras/reordenar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reorderPayload),
      });
      if (!res.ok) throw new Error("Erro ao reordenar");

      // Save destaque for each that changed
      const original = obras ?? [];
      const destaqueMutations = lista
        .filter((o) => {
          const orig = original.find((x) => x.id === o.id);
          return orig && orig.destaque !== o.destaque;
        })
        .map((o) =>
          updateObra.mutateAsync({ id: o.id, data: { destaque: o.destaque } as Parameters<typeof updateObra.mutateAsync>[0]["data"] })
        );
      await Promise.all(destaqueMutations);

      queryClient.invalidateQueries({ queryKey: getListObrasQueryKey() });
      toast({ title: "Guardado com sucesso" });
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Ordem e Destaque</h1>
        </div>
        <Button onClick={saveAll} disabled={saving || isLoading} className="rounded-none text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90">
          {saving ? "A guardar…" : "Guardar"}
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <span>= aparece em Destaque na página inicial (destaque até 4 obras)</span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">Pressione e arraste uma obra para definir a ordem. Também pode usar as setas. Clique em Guardar para aplicar.</p>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : (
        <div
          className="border border-[hsl(40,10%,85%)] bg-white divide-y divide-[hsl(40,10%,85%)]"
          onPointerMove={updateDrag}
          onPointerUp={finishDrag}
          onPointerCancel={cancelDrag}
        >
          {lista.map((obra, idx) => (
            <div
              key={obra.id}
              data-order-index={idx}
              onPointerDown={(e) => startDrag(idx, e)}
              className={`flex items-center gap-3 px-3 py-3 select-none touch-none transition-colors ${
                draggedIndex === idx ? "bg-[hsl(40,43%,96%)] opacity-60" : ""
              } ${
                dropIndex === idx && draggedIndex !== idx ? "bg-primary/10 ring-inset ring-2 ring-primary/40" : ""
              }`}
              data-testid={`draggable-obra-${obra.id}`}
            >
              <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{idx + 1}</span>
              <GripVertical size={18} className="text-muted-foreground/60 shrink-0" aria-label="Arrastar obra" />
              {obra.imagemUrl ? (
                <img src={obra.imagemUrl} alt={obra.titulo} className="w-10 h-10 object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-[hsl(40,43%,96%)] shrink-0" />
              )}
              <p className="flex-1 text-sm font-medium truncate">{obra.titulo}</p>
              <button
                onClick={() => toggleDestaque(idx)}
                className="p-2 rounded-sm transition-colors shrink-0"
                aria-label="Toggle destaque"
              >
                <Star
                  size={18}
                  className={obra.destaque ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}
                />
              </button>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveByButton(idx, -1)}
                  disabled={idx === 0}
                  className="p-2 text-muted-foreground disabled:opacity-20"
                  aria-label={`Subir ${obra.titulo}`}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveByButton(idx, 1)}
                  disabled={idx === lista.length - 1}
                  className="p-2 text-muted-foreground disabled:opacity-20"
                  aria-label={`Descer ${obra.titulo}`}
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
