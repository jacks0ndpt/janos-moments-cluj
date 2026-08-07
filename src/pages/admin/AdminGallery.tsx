import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GalleryImage } from "@/components/admin/GalleryImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  formatBytes,
  formatDimensions,
  needsOptimization,
  savedPercent,
} from "@/lib/imageOptimizer";
import { optimizeStoredImage } from "@/lib/optimizeStored";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Database } from "@/integrations/supabase/types";

type ImageRow = Database["public"]["Tables"]["gallery_images"]["Row"];
type Category = Database["public"]["Tables"]["gallery_categories"]["Row"];
type Story = Database["public"]["Tables"]["gallery_stories"]["Row"];
type Template = Database["public"]["Tables"]["alt_templates"]["Row"];

type StatusFilter = "all" | "draft" | "published" | "archived";
type SortMode = "custom" | "newest" | "oldest" | "filename";

const MIN_GAP = 0.001;

export default function AdminGallery() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [homepageIds, setHomepageIds] = useState<Set<string>>(new Set());
  const [categoryId, setCategoryId] = useState<string>("all");
  const [storyId, setStoryId] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortMode>("custom");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [homepageOnly, setHomepageOnly] = useState(false);
  const [missingAltOnly, setMissingAltOnly] = useState(false);
  const [oversizedOnly, setOversizedOnly] = useState(false);
  const [optimizing, setOptimizing] = useState<null | { done: number; total: number }>(null);
  const [optSummary, setOptSummary] = useState<null | {
    count: number;
    failed: number;
    before: number;
    after: number;
  }>(null);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [deleteMode, setDeleteMode] = useState<null | "single" | "bulk">(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [moveRequest, setMoveRequest] = useState<null | {
    mode: "single" | "bulk";
    ids: string[];
    targetCategoryId: string;
    namedStory: boolean;
  }>(null);

  async function load() {
    const [i, c, s, t, h] = await Promise.all([
      supabase.from("gallery_images").select("*").order("position", { ascending: true }),
      supabase.from("gallery_categories").select("*").order("position"),
      supabase.from("gallery_stories").select("*").order("position"),
      supabase.from("alt_templates").select("*").order("key"),
      supabase.from("homepage_featured").select("image_id"),
    ]);
    if (i.data) setImages(i.data);
    if (c.data) setCategories(c.data);
    if (s.data) setStories(s.data);
    if (t.data) setTemplates(t.data);
    if (h.data) setHomepageIds(new Set(h.data.map((r) => r.image_id)));
  }

  useEffect(() => {
    load();
  }, []);

  const storyById = useMemo(() => {
    const m = new Map<string, Story>();
    stories.forEach((s) => m.set(s.id, s));
    return m;
  }, [stories]);

  const categoryById = useMemo(() => {
    const m = new Map<string, Category>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const categoryOfImage = (img: ImageRow) => storyById.get(img.story_id)?.category_id;

  const storiesInCategory = useMemo(
    () => (categoryId === "all" ? [] : stories.filter((s) => s.category_id === categoryId)),
    [stories, categoryId],
  );

  const filtered = useMemo(() => {
    const rows = images.filter((img) => {
      if (status !== "all" && img.status !== status) return false;
      if (categoryId !== "all" && categoryOfImage(img) !== categoryId) return false;
      if (storyId !== "all" && img.story_id !== storyId) return false;
      if (favoritesOnly && !img.is_favorite) return false;
      if (homepageOnly && !homepageIds.has(img.id)) return false;
      if (missingAltOnly && img.status === "published" && img.alt_ro && img.alt_en) return false;
      if (missingAltOnly && img.status !== "published") return false;
      if (oversizedOnly && !needsOptimization(img)) return false;
      return true;
    });
    const sorted = [...rows];
    if (sort === "custom") {
      sorted.sort((a, b) => {
        const sa = storyById.get(a.story_id)?.position ?? 0;
        const sb = storyById.get(b.story_id)?.position ?? 0;
        if (sa !== sb) return sa - sb;
        return a.position - b.position;
      });
    } else if (sort === "newest") {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else {
      sorted.sort((a, b) =>
        (a.original_filename ?? a.storage_path).localeCompare(b.original_filename ?? b.storage_path),
      );
    }
    return sorted;
  }, [
    images,
    status,
    categoryId,
    storyId,
    favoritesOnly,
    homepageOnly,
    missingAltOnly,
    oversizedOnly,
    homepageIds,
    storyById,
    sort,
  ]);

  const secondaryFilterActive =
    favoritesOnly || homepageOnly || missingAltOnly || oversizedOnly || status !== "all";
  const dragEnabled = sort === "custom" && categoryId !== "all" && !secondaryFilterActive;
  const dragHint = !dragEnabled
    ? sort !== "custom"
      ? "Switch Sort to Custom to reorder images."
      : categoryId === "all"
        ? "Select a single category to reorder images."
        : "Clear secondary filters to reorder the complete category."
    : "Drag to reorder";

  const allSelected = filtered.length > 0 && filtered.every((i) => selection.has(i.id));

  function toggle(id: string) {
    setSelection((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function bulk(patch: Partial<ImageRow>) {
    const ids = [...selection];
    if (!ids.length) return;
    const { error } = await supabase.from("gallery_images").update(patch).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`Updated ${ids.length}`);
    load();
  }

  async function bulkHomepage(add: boolean) {
    const ids = [...selection];
    if (!ids.length) return;
    if (add) {
      const rows = ids
        .filter((id) => !homepageIds.has(id))
        .map((id, idx) => ({ image_id: id, position: (idx + 1) * 1000 + Date.now() }));
      if (rows.length) {
        const { error } = await supabase.from("homepage_featured").insert(rows);
        if (error) return toast.error(error.message);
      }
    } else {
      const { error } = await supabase.from("homepage_featured").delete().in("image_id", ids);
      if (error) return toast.error(error.message);
    }
    toast.success("Homepage updated");
    load();
  }

  async function applyAltTemplate(key: string, lang: "ro" | "en") {
    const body = templates.find((t) => t.key === key && t.language === lang)?.body;
    if (!body) return;
    await bulk(lang === "ro" ? { alt_ro: body } : { alt_en: body });
  }

  /* ---------------- drag & drop ordering ---------------- */

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = filtered.findIndex((i) => i.id === active.id);
    const newIndex = filtered.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = filtered[oldIndex];
    const target = filtered[newIndex];
    if (moved.story_id !== target.story_id) {
      toast.error("Images can only be reordered within the same story.");
      return;
    }

    const previous = images;
    const next = arrayMove(filtered, oldIndex, newIndex);

    const before = next[newIndex - 1];
    const after = next[newIndex + 1];
    const lo = before ? before.position : (after ? after.position - 2000 : 0);
    const hi = after ? after.position : (before ? before.position + 2000 : 1000);
    const midpoint = (lo + hi) / 2;
    const needsRebalance = hi - lo < MIN_GAP * 2;

    let ids: string[];
    let positions: number[];
    if (needsRebalance) {
      ids = next.map((i) => i.id);
      positions = next.map((_, idx) => (idx + 1) * 1000);
    } else {
      ids = [moved.id];
      positions = [midpoint];
    }

    const posById = new Map(ids.map((id, idx) => [id, positions[idx]]));
    setImages((prev) =>
      prev.map((img) => (posById.has(img.id) ? { ...img, position: posById.get(img.id)! } : img)),
    );

    const { error } = await supabase.rpc("set_image_positions", {
      _ids: ids,
      _positions: positions,
    });
    if (error) {
      setImages(previous);
      toast.error(`Could not save order: ${error.message}`);
    }
  }

  /* ---------------- change category ---------------- */

  function requestCategoryChange(mode: "single" | "bulk", targetCategoryId: string, id?: string) {
    const ids = mode === "single" && id ? [id] : [...selection];
    if (!ids.length) return;
    const namedStory = ids.some((imgId) => {
      const img = images.find((r) => r.id === imgId);
      const st = img ? storyById.get(img.story_id) : undefined;
      return st ? !st.is_system : false;
    });
    if (namedStory) {
      setMoveRequest({ mode, ids, targetCategoryId, namedStory });
      return;
    }
    void moveToCategory(ids, targetCategoryId);
  }

  async function moveToCategory(ids: string[], targetCategoryId: string) {
    setBusy(true);
    try {
      const { data: targetStoryId, error: storyErr } = await supabase.rpc("ensure_default_story", {
        _category_id: targetCategoryId,
      });
      if (storyErr || !targetStoryId) {
        toast.error(storyErr?.message ?? "Could not resolve the destination default story.");
        return;
      }

      const { data: last, error: maxErr } = await supabase
        .from("gallery_images")
        .select("position")
        .eq("story_id", targetStoryId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (maxErr) {
        toast.error(maxErr.message);
        return;
      }
      let base = last?.position ?? 0;

      // preserve relative order of the moved images
      const ordered = ids
        .map((id) => images.find((r) => r.id === id))
        .filter((r): r is ImageRow => !!r)
        .sort((a, b) => a.position - b.position);

      for (const img of ordered) {
        base += 1000;
        const { error } = await supabase
          .from("gallery_images")
          .update({ story_id: targetStoryId, position: base })
          .eq("id", img.id);
        if (error) {
          toast.error(error.message);
          await load();
          return;
        }
      }

      toast.success(
        `Moved ${ordered.length} image${ordered.length === 1 ? "" : "s"} to ${
          categoryById.get(targetCategoryId)?.name_en ?? "category"
        }`,
      );
      setSelection(new Set());
      await load();
    } finally {
      setBusy(false);
      setMoveRequest(null);
    }
  }

  /* ---------------- delete / archive ---------------- */

  function openDelete(mode: "single" | "bulk", id?: string) {
    setDeleteMode(mode);
    setDeleteTarget(id ?? null);
    setConfirmText("");
  }

  async function doArchive() {
    const ids = deleteMode === "single" && deleteTarget ? [deleteTarget] : [...selection];
    const { error } = await supabase
      .from("gallery_images")
      .update({ status: "archived" })
      .in("id", ids);
    if (error) return toast.error(error.message);
    toast.success("Archived");
    setDeleteMode(null);
    setSelection(new Set());
    load();
  }

  async function doPermanentDelete() {
    if (confirmText !== "DELETE") return;
    const ids = deleteMode === "single" && deleteTarget ? [deleteTarget] : [...selection];
    const rows = ids
      .map((id) => images.find((r) => r.id === id))
      .filter((r): r is ImageRow => !!r);
    if (!rows.length) return;

    setBusy(true);
    const deletedIds: string[] = [];
    const orphaned: ImageRow[] = [];
    const failures: string[] = [];

    for (const row of rows) {
      // 1. remove the file through the Storage API (never storage.objects SQL)
      const { data: existing } = await supabase.storage
        .from("gallery")
        .list(row.storage_path.split("/").slice(0, -1).join("/") || undefined, {
          search: row.storage_path.split("/").pop() ?? "",
        });
      const fileExists = (existing ?? []).some(
        (f) => f.name === (row.storage_path.split("/").pop() ?? ""),
      );

      if (!fileExists) {
        orphaned.push(row);
        continue;
      }

      const { error: storageErr } = await supabase.storage.from("gallery").remove([row.storage_path]);
      if (storageErr) {
        failures.push(`${row.original_filename ?? row.storage_path}: ${storageErr.message}`);
        continue;
      }
      deletedIds.push(row.id);
    }

    if (deletedIds.length) {
      // 2. only now remove the DB rows (homepage_featured cascades)
      const { error } = await supabase.from("gallery_images").delete().in("id", deletedIds);
      if (error) {
        setBusy(false);
        toast.error(`Files removed but database delete failed: ${error.message}`);
        await load();
        return;
      }
    }

    setBusy(false);
    setDeleteMode(null);
    setSelection(new Set());
    await load();

    if (deletedIds.length) {
      toast.success(`Deleted ${deletedIds.length} image${deletedIds.length === 1 ? "" : "s"}`);
    }
    if (failures.length) {
      toast.error(`Storage deletion failed (rows kept): ${failures.join(" | ")}`);
    }
    if (orphaned.length) {
      setOrphans(orphaned);
    }
  }

  const [orphans, setOrphans] = useState<ImageRow[]>([]);

  async function deleteOrphanRows() {
    const ids = orphans.map((o) => o.id);
    const { error } = await supabase.from("gallery_images").delete().in("id", ids);
    setOrphans([]);
    if (error) return toast.error(error.message);
    toast.success(`Removed ${ids.length} orphaned record${ids.length === 1 ? "" : "s"}`);
    load();
  }

  const deleteCount = deleteMode === "single" ? 1 : deleteMode === "bulk" ? selection.size : 0;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif">Gallery ({filtered.length})</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-3 border rounded-md">
          <Select
            value={categoryId}
            onValueChange={(v) => {
              setCategoryId(v);
              setStoryId("all");
            }}
          >
            <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryId !== "all" && storiesInCategory.length > 0 && (
            <Select value={storyId} onValueChange={setStoryId}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Story" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stories</SelectItem>
                {storiesInCategory.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title_en}{s.is_system ? " (default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom order</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="filename">Filename</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={favoritesOnly} onCheckedChange={(v) => setFavoritesOnly(!!v)} />
            Favorites
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={homepageOnly} onCheckedChange={(v) => setHomepageOnly(!!v)} />
            On homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={missingAltOnly} onCheckedChange={(v) => setMissingAltOnly(!!v)} />
            Missing alt
          </label>
          <div className="ml-auto flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(v) => {
                if (v) setSelection(new Set(filtered.map((f) => f.id)));
                else setSelection(new Set());
              }}
            />
            <span className="text-sm">Select all</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{dragHint}</p>

        {selection.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 border rounded-md bg-muted">
            <span className="text-sm font-medium">{selection.size} selected</span>
            <Button size="sm" onClick={() => bulk({ status: "published" })}>Publish</Button>
            <Button size="sm" variant="outline" onClick={() => bulk({ status: "draft" })}>Draft</Button>
            <Button size="sm" variant="outline" onClick={() => bulk({ status: "archived" })}>Archive</Button>
            <Button size="sm" variant="outline" onClick={() => bulk({ is_favorite: true })}>★ Favorite</Button>
            <Button size="sm" variant="outline" onClick={() => bulk({ is_favorite: false })}>Unfavorite</Button>
            <Button size="sm" variant="outline" onClick={() => bulkHomepage(true)}>+ Homepage</Button>
            <Button size="sm" variant="outline" onClick={() => bulkHomepage(false)}>− Homepage</Button>
            <Select onValueChange={(v) => requestCategoryChange("bulk", v)}>
              <SelectTrigger className="w-44 h-8"><SelectValue placeholder="Change category…" /></SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.status !== "archived")
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => applyAltTemplate(v, "ro")}>
              <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Apply Alt RO…" /></SelectTrigger>
              <SelectContent>
                {templates.filter((t) => t.language === "ro").map((t) => (
                  <SelectItem key={t.id} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => applyAltTemplate(v, "en")}>
              <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Apply Alt EN…" /></SelectTrigger>
              <SelectContent>
                {templates.filter((t) => t.language === "en").map((t) => (
                  <SelectItem key={t.id} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="destructive" onClick={() => openDelete("bulk")}>Delete…</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelection(new Set())}>Clear</Button>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={filtered.map((f) => f.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((img) => (
                <ImageCard
                  key={img.id}
                  img={img}
                  dragEnabled={dragEnabled}
                  dragHint={dragHint}
                  selected={selection.has(img.id)}
                  onHome={homepageIds.has(img.id)}
                  categoryName={
                    categoryById.get(categoryOfImage(img) ?? "")?.name_en ?? "—"
                  }
                  storyName={storyById.get(img.story_id)?.title_en ?? ""}
                  categories={categories}
                  onToggle={() => toggle(img.id)}
                  onFavorite={async () => {
                    const next = !img.is_favorite;
                    await supabase.from("gallery_images").update({ is_favorite: next }).eq("id", img.id);
                    setImages((prev) => prev.map((r) => (r.id === img.id ? { ...r, is_favorite: next } : r)));
                  }}
                  onDelete={() => openDelete("single", img.id)}
                  onChangeCategory={(cat) => requestCategoryChange("single", cat, img.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <AlertDialog open={!!deleteMode} onOpenChange={(o) => !o && setDeleteMode(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteCount} image{deleteCount === 1 ? "" : "s"}</AlertDialogTitle>
              <AlertDialogDescription>
                Archive keeps the file and hides it from the public site. Permanent delete removes the
                stored file first and then the database record — this cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                To permanently delete, type <span className="font-mono">DELETE</span> below:
              </label>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            </div>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={doArchive}>Archive</AlertDialogAction>
              <Button
                variant="destructive"
                disabled={confirmText !== "DELETE" || busy}
                onClick={doPermanentDelete}
              >
                Delete permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={orphans.length > 0} onOpenChange={(o) => !o && setOrphans([])}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>File already missing</AlertDialogTitle>
              <AlertDialogDescription>
                {orphans.length} record{orphans.length === 1 ? "" : "s"} point to files that no longer
                exist in storage. Do you want to delete the orphaned database record
                {orphans.length === 1 ? "" : "s"} only?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep records</AlertDialogCancel>
              <AlertDialogAction onClick={deleteOrphanRows}>Delete records</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!moveRequest} onOpenChange={(o) => !o && setMoveRequest(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Move out of the current story?</AlertDialogTitle>
              <AlertDialogDescription>
                Changing category will move this image out of its current story and into the selected
                category’s default story.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  moveRequest && moveToCategory(moveRequest.ids, moveRequest.targetCategoryId)
                }
              >
                Move
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function ImageCard({
  img,
  dragEnabled,
  dragHint,
  selected,
  onHome,
  categoryName,
  storyName,
  categories,
  onToggle,
  onFavorite,
  onDelete,
  onChangeCategory,
}: {
  img: ImageRow;
  dragEnabled: boolean;
  dragHint: string;
  selected: boolean;
  onHome: boolean;
  categoryName: string;
  storyName: string;
  categories: Category[];
  onToggle: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onChangeCategory: (categoryId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id,
    disabled: !dragEnabled,
  });
  const missing = img.status === "published" && (!img.alt_ro || !img.alt_en);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative border rounded-md overflow-hidden bg-card ${
        selected ? "ring-2 ring-primary" : ""
      } ${isDragging ? "opacity-70 z-10" : ""}`}
    >
      <div className="aspect-square bg-muted">
        <GalleryImage path={img.storage_path} className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
        <Badge variant="secondary">{img.status}</Badge>
        {onHome && <Badge>homepage</Badge>}
        {missing && <Badge variant="destructive">alt</Badge>}
      </div>
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              {...attributes}
              {...listeners}
              disabled={!dragEnabled}
              className={`h-6 w-6 rounded text-xs flex items-center justify-center ${
                dragEnabled
                  ? "bg-black/60 text-white cursor-grab active:cursor-grabbing"
                  : "bg-black/30 text-white/50 cursor-not-allowed"
              }`}
              aria-label="drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{dragHint}</TooltipContent>
        </Tooltip>
        <button
          onClick={onToggle}
          className="h-6 w-6 rounded bg-black/60 text-white text-xs flex items-center justify-center"
          aria-label="select"
        >
          {selected ? "✓" : "○"}
        </button>
        <button
          onClick={onFavorite}
          className={`h-6 w-6 rounded text-xs flex items-center justify-center ${
            img.is_favorite ? "bg-yellow-400" : "bg-black/60 text-white"
          }`}
          aria-label="favorite"
        >
          ★
        </button>
        <button
          onClick={onDelete}
          className="h-6 w-6 rounded bg-black/60 text-white text-xs flex items-center justify-center"
          aria-label="delete"
        >
          ✕
        </button>
      </div>
      <div className="p-2 space-y-1">
        <div className="text-xs truncate">{img.original_filename ?? img.storage_path}</div>
        <div className="text-[11px] text-muted-foreground truncate">
          {categoryName}
          {storyName ? ` · ${storyName}` : ""}
        </div>
        <Select onValueChange={onChangeCategory}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Change category…" />
          </SelectTrigger>
          <SelectContent>
            {categories
              .filter((c) => c.status !== "archived")
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
