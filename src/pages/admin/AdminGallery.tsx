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
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ImageRow = Database["public"]["Tables"]["gallery_images"]["Row"];
type Category = Database["public"]["Tables"]["gallery_categories"]["Row"];
type Story = Database["public"]["Tables"]["gallery_stories"]["Row"];
type Template = Database["public"]["Tables"]["alt_templates"]["Row"];

type StatusFilter = "all" | "draft" | "published" | "archived";

export default function AdminGallery() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [homepageIds, setHomepageIds] = useState<Set<string>>(new Set());
  const [categoryId, setCategoryId] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [homepageOnly, setHomepageOnly] = useState(false);
  const [missingAltOnly, setMissingAltOnly] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [deleteMode, setDeleteMode] = useState<null | "single" | "bulk">(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  async function load() {
    const [i, c, s, t, h] = await Promise.all([
      supabase.from("gallery_images").select("*").order("created_at", { ascending: false }),
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

  const storyToCategory = useMemo(() => {
    const m = new Map<string, string>();
    stories.forEach((s) => m.set(s.id, s.category_id));
    return m;
  }, [stories]);

  const filtered = useMemo(() => {
    return images.filter((img) => {
      if (status !== "all" && img.status !== status) return false;
      if (categoryId !== "all" && storyToCategory.get(img.story_id) !== categoryId) return false;
      if (favoritesOnly && !img.is_favorite) return false;
      if (homepageOnly && !homepageIds.has(img.id)) return false;
      if (missingAltOnly && img.status === "published" && img.alt_ro && img.alt_en) return false;
      if (missingAltOnly && img.status !== "published") return false;
      return true;
    });
  }, [images, status, categoryId, favoritesOnly, homepageOnly, missingAltOnly, homepageIds, storyToCategory]);

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

  function openDelete(mode: "single" | "bulk", id?: string) {
    setDeleteMode(mode);
    setDeleteTarget(id ?? null);
    setConfirmText("");
  }

  async function doArchive() {
    if (deleteMode === "single" && deleteTarget) {
      const { error } = await supabase
        .from("gallery_images")
        .update({ status: "archived" })
        .eq("id", deleteTarget);
      if (error) return toast.error(error.message);
    } else {
      const ids = [...selection];
      const { error } = await supabase
        .from("gallery_images")
        .update({ status: "archived" })
        .in("id", ids);
      if (error) return toast.error(error.message);
    }
    toast.success("Archived");
    setDeleteMode(null);
    setSelection(new Set());
    load();
  }

  async function doPermanentDelete() {
    if (confirmText !== "DELETE") return;
    const ids = deleteMode === "single" && deleteTarget ? [deleteTarget] : [...selection];
    const { error } = await supabase.from("gallery_images").delete().in("id", ids);
    if (error) return toast.error(error.message);
    toast.success("Deleted permanently");
    setDeleteMode(null);
    setSelection(new Set());
    load();
  }

  const deleteCount =
    deleteMode === "single" ? 1 : deleteMode === "bulk" ? selection.size : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Gallery ({filtered.length})</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-3 border rounded-md">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((img) => {
          const selected = selection.has(img.id);
          const onHome = homepageIds.has(img.id);
          const missing = img.status === "published" && (!img.alt_ro || !img.alt_en);
          return (
            <div
              key={img.id}
              className={`relative border rounded-md overflow-hidden ${selected ? "ring-2 ring-primary" : ""}`}
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
                <button
                  onClick={() => toggle(img.id)}
                  className="h-6 w-6 rounded bg-black/60 text-white text-xs flex items-center justify-center"
                  aria-label="select"
                >
                  {selected ? "✓" : "○"}
                </button>
                <button
                  onClick={async () => {
                    const next = !img.is_favorite;
                    await supabase.from("gallery_images").update({ is_favorite: next }).eq("id", img.id);
                    setImages((prev) => prev.map((r) => (r.id === img.id ? { ...r, is_favorite: next } : r)));
                  }}
                  className={`h-6 w-6 rounded text-xs flex items-center justify-center ${
                    img.is_favorite ? "bg-yellow-400" : "bg-black/60 text-white"
                  }`}
                  aria-label="favorite"
                >
                  ★
                </button>
                <button
                  onClick={() => openDelete("single", img.id)}
                  className="h-6 w-6 rounded bg-black/60 text-white text-xs flex items-center justify-center"
                  aria-label="delete"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 text-xs truncate">{img.original_filename ?? img.storage_path}</div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!deleteMode} onOpenChange={(o) => !o && setDeleteMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteCount} image{deleteCount === 1 ? "" : "s"}</AlertDialogTitle>
            <AlertDialogDescription>
              Archive keeps the file and hides it from the public site. Permanent delete removes the
              database row and the underlying file — this cannot be undone.
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
            <Button variant="destructive" disabled={confirmText !== "DELETE"} onClick={doPermanentDelete}>
              Delete permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}