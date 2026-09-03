import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Copy, ExternalLink, RefreshCw, Star, Trash2 } from "lucide-react";
import {
  detectOrientationFrom,
  formatBytes,
  formatDimensions,
  optimizeImage,
  savedPercent,
} from "@/lib/imageOptimizer";
import {
  PREVIEW_PREFIX,
  previewImageUrl,
  previewPublicPath,
  previewPublicUrl,
  removePreviewFiles,
  type PreviewImageRow,
  type PreviewRow,
} from "@/lib/samedayPreview";

type Failed = { file: File; reason: string };
type Stat = {
  name: string;
  original: { width: number; height: number; size: number };
  optimized: { width: number; height: number; size: number };
};

export default function AdminPreviewEdit() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<PreviewRow | null>(null);
  const [images, setImages] = useState<PreviewImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [failed, setFailed] = useState<Failed[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p, error }, { data: imgs }] = await Promise.all([
      supabase.from("same_day_previews").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("same_day_preview_images")
        .select("*")
        .eq("preview_id", id)
        .order("position", { ascending: true }),
    ]);
    setLoading(false);
    if (error) return toast.error(error.message);
    setPreview(p ?? null);
    setImages(imgs ?? []);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(fields: Partial<PreviewRow>) {
    if (!preview) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("same_day_previews")
      .update(fields)
      .eq("id", preview.id)
      .select("*")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setPreview(data);
  }

  /** Optimize (max 2000 px, progressive JPEG q82) then upload one file. */
  async function uploadOne(file: File, position: number): Promise<PreviewImageRow> {
    const opt = await optimizeImage(file, file.name);
    const path = `${PREVIEW_PREFIX}/${id}/${crypto.randomUUID()}.jpg`;
    const up = await supabase.storage
      .from("gallery")
      .upload(path, opt.blob, { contentType: "image/jpeg" });
    if (up.error) throw up.error;
    const { data: row, error } = await supabase
      .from("same_day_preview_images")
      .insert({
        preview_id: id,
        storage_path: path,
        original_filename: file.name,
        width: opt.optimized.width,
        height: opt.optimized.height,
        orientation: detectOrientationFrom(opt.optimized.width, opt.optimized.height),
        file_size: opt.optimized.size,
        position,
      })
      .select("*")
      .single();
    if (error) {
      await removePreviewFiles([path]).catch(() => undefined);
      throw error;
    }
    setStats((prev) => [
      { name: file.name, original: { ...opt.original, size: file.size }, optimized: opt.optimized },
      ...prev,
    ]);
    return row;
  }

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    let pos = (images.length ? images[images.length - 1].position : 0) + 1000;
    const added: PreviewImageRow[] = [];
    const errors: Failed[] = [];
    for (const file of files) {
      try {
        const row = await uploadOne(file, pos);
        added.push(row);
        pos += 1000;
      } catch (err: any) {
        errors.push({ file, reason: err?.message ?? "Upload failed" });
      } finally {
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    }
    setImages((prev) => [...prev, ...added]);
    setFailed((prev) => [...prev, ...errors]);
    setUploading(false);
    if (added.length) toast.success(`Uploaded ${added.length} photo(s)`);
    if (errors.length) toast.error(`${errors.length} photo(s) failed — retry below`);
    // First upload becomes the cover automatically.
    if (!preview?.cover_image_id && added[0]) patch({ cover_image_id: added[0].id });
  }

  async function retry(item: Failed) {
    setFailed((prev) => prev.filter((f) => f !== item));
    await uploadFiles([item.file]);
  }

  const dz = useDropzone({
    onDrop: uploadFiles,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    disabled: uploading,
  });

  async function removeImage(row: PreviewImageRow) {
    if (preview?.cover_image_id === row.id) {
      await patch({ cover_image_id: null });
    }
    const { error } = await supabase.from("same_day_preview_images").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    await removePreviewFiles([row.storage_path]).catch(() => undefined);
    setImages((prev) => prev.filter((i) => i.id !== row.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(images, oldIdx, newIdx).map((img, i) => ({
      ...img,
      position: (i + 1) * 1000,
    }));
    setImages(next);
    for (const img of next) {
      const { error } = await supabase
        .from("same_day_preview_images")
        .update({ position: img.position })
        .eq("id", img.id);
      if (error) {
        toast.error(error.message);
        break;
      }
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!preview)
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">This preview no longer exists.</p>
        <Button variant="outline" onClick={() => navigate("/admin/previews")}>
          Back to previews
        </Button>
      </div>
    );

  return (
    <div className="w-full min-w-0 max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/previews">
              <ArrowLeft size={16} />
            </Link>
          </Button>
          <h1 className="min-w-0 break-words text-xl font-serif sm:text-2xl">{preview.couple_names}</h1>
          <Badge variant={preview.is_published ? "default" : "secondary"}>
            {preview.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={previewPublicPath(preview.slug)} target="_blank">
              <ExternalLink size={14} className="mr-1.5" /> View
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(previewPublicUrl(preview.slug));
                toast.success("Link copied to clipboard");
              } catch {
                toast.error("Could not copy the link");
              }
            }}
          >
            <Copy size={14} className="mr-1.5" /> Copy Link
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div>
            <Label htmlFor="names">Couple names</Label>
            <Input
              id="names"
              defaultValue={preview.couple_names}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== preview.couple_names) patch({ couple_names: v });
              }}
            />
          </div>
          <div>
            <Label htmlFor="date">Wedding date</Label>
            <Input
              id="date"
              type="date"
              defaultValue={preview.wedding_date}
              onBlur={(e) => {
                if (e.target.value && e.target.value !== preview.wedding_date)
                  patch({ wedding_date: e.target.value });
              }}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="msg">Short message</Label>
            <Textarea
              id="msg"
              rows={2}
              defaultValue={preview.message ?? ""}
              onBlur={(e) => patch({ message: e.target.value.trim() || null })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Public URL</Label>
            <p className="mt-1 break-all text-sm text-muted-foreground">
              {previewPublicUrl(preview.slug)}
            </p>
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch
              id="pub"
              checked={preview.is_published}
              onCheckedChange={(v) => patch({ is_published: v })}
              disabled={saving}
            />
            <Label htmlFor="pub">Published (the link works for the couple)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos ({images.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...dz.getRootProps()}
            className="cursor-pointer rounded border border-dashed p-8 text-center text-sm text-muted-foreground hover:border-primary"
          >
            <input {...dz.getInputProps()} />
            {uploading
              ? `Optimizing & uploading… ${progress.done}/${progress.total}`
              : "Drop photos here or click to select (JPEG, PNG, WebP — around 1–30 photos)"}
          </div>

          {failed.length > 0 && (
            <div className="space-y-2 rounded border border-destructive/40 p-3">
              <p className="text-sm font-medium text-destructive">Failed uploads</p>
              {failed.map((f, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">
                    {f.file.name} — {f.reason}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => retry(f)}>
                    <RefreshCw size={14} className="mr-1.5" /> Retry
                  </Button>
                </div>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="rounded border p-3 text-xs text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">Optimization results</p>
              {stats.map((s, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <span className="truncate">{s.name}</span>
                  <span>
                    {formatDimensions(s.original.width, s.original.height)} ·{" "}
                    {formatBytes(s.original.size)} →{" "}
                    {formatDimensions(s.optimized.width, s.optimized.height)} ·{" "}
                    {formatBytes(s.optimized.size)} (−
                    {savedPercent(s.original.size, s.optimized.size)}%)
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Drag to set the order shown to the couple. Click the star to pick the cover photo.
          </p>

          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((img) => (
                  <SortablePhoto
                    key={img.id}
                    image={img}
                    isCover={preview.cover_image_id === img.id}
                    onCover={() => patch({ cover_image_id: img.id })}
                    onRemove={() => removeImage(img)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {images.length === 0 && (
            <p className="text-sm text-muted-foreground">No photos yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SortablePhoto({
  image,
  isCover,
  onCover,
  onRemove,
}: {
  image: PreviewImageRow;
  isCover: boolean;
  onCover: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative overflow-hidden rounded border ${isCover ? "border-primary" : "border-border"} ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <img
          src={previewImageUrl(image.storage_path)}
          alt={image.original_filename ?? "Preview photo"}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex items-center justify-between gap-1 p-1.5 text-[11px] text-muted-foreground">
        <span className="truncate">
          {formatDimensions(image.width, image.height)} · {formatBytes(image.file_size)}
        </span>
      </div>
      <div className="absolute right-1 top-1 flex gap-1">
        <button
          type="button"
          onClick={onCover}
          aria-label={isCover ? "Cover photo" : "Set as cover photo"}
          className={`rounded bg-background/85 p-1.5 ${isCover ? "text-primary" : "text-muted-foreground"}`}
        >
          <Star size={14} fill={isCover ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          className="rounded bg-background/85 p-1.5 text-destructive"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {isCover && (
        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
          Cover
        </span>
      )}
    </div>
  );
}
