import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { GalleryImage } from "@/components/admin/GalleryImage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Image = Database["public"]["Tables"]["gallery_images"]["Row"];
type Featured = { id: string; image_id: string; position: number };

export default function AdminHomepage() {
  const [featured, setFeatured] = useState<(Featured & { image?: Image })[]>([]);
  const [available, setAvailable] = useState<Image[]>([]);

  async function load() {
    const [f, i] = await Promise.all([
      supabase.from("homepage_featured").select("*").order("position"),
      supabase.from("gallery_images").select("*").eq("status", "published"),
    ]);
    const imgMap = new Map((i.data ?? []).map((r) => [r.id, r]));
    setFeatured((f.data ?? []).map((r) => ({ ...r, image: imgMap.get(r.image_id) })));
    const featIds = new Set((f.data ?? []).map((r) => r.image_id));
    setAvailable((i.data ?? []).filter((r) => !featIds.has(r.id)));
  }
  useEffect(() => { load(); }, []);

  async function add(id: string) {
    const pos = (featured.length ? featured[featured.length - 1].position : 0) + 1000;
    const { error } = await supabase.from("homepage_featured").insert({ image_id: id, position: pos });
    if (error) return toast.error(error.message);
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("homepage_featured").delete().eq("image_id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = featured.findIndex((f) => f.id === active.id);
    const newIdx = featured.findIndex((f) => f.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(featured, oldIdx, newIdx);
    // Reassign positions
    const reassigned = next.map((r, i) => ({ ...r, position: (i + 1) * 1000 }));
    setFeatured(reassigned);
    for (const r of reassigned) {
      await supabase.from("homepage_featured").update({ position: r.position }).eq("id", r.id);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Homepage featured ({featured.length})</h1>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Featured (drag to reorder)</h2>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={featured.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {featured.map((f) => (
                <SortableCard key={f.id} id={f.id} onRemove={() => remove(f.image_id)}>
                  {f.image && <GalleryImage path={f.image.storage_path} className="w-full h-full object-cover" />}
                </SortableCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Available published images</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {available.map((img) => (
            <div key={img.id} className="relative border rounded overflow-hidden">
              <div className="aspect-square bg-muted">
                <GalleryImage path={img.storage_path} className="w-full h-full object-cover" />
              </div>
              <Button size="sm" className="absolute bottom-1 right-1" onClick={() => add(img.id)}>+</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SortableCard({ id, children, onRemove }: { id: string; children: React.ReactNode; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative border rounded overflow-hidden">
      <div className="aspect-square bg-muted cursor-move" {...attributes} {...listeners}>
        {children}
      </div>
      <Button size="sm" variant="destructive" className="absolute top-1 right-1 h-6 px-2" onClick={onRemove}>×</Button>
    </div>
  );
}