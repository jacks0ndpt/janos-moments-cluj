import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  formatBytes,
  formatDimensions,
  optimizeImage,
  savedPercent,
  detectOrientationFrom,
} from "@/lib/imageOptimizer";
import { GalleryImage } from "@/components/admin/GalleryImage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["gallery_categories"]["Row"];
type Story = Database["public"]["Tables"]["gallery_stories"]["Row"];
type Template = Database["public"]["Tables"]["alt_templates"]["Row"];
type ImageRow = Database["public"]["Tables"]["gallery_images"]["Row"];

type StatusChoice = "draft" | "published" | "archived";

type UploadStat = {
  name: string;
  original: { width: number; height: number; size: number };
  optimized: { width: number; height: number; size: number };
};

export default function AdminUpload() {
  const { user } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [storyChoice, setStoryChoice] = useState<string>("auto"); // 'auto' | 'new' | story id
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [status, setStatus] = useState<StatusChoice>("draft");
  const [altRoKey, setAltRoKey] = useState<string>("none");
  const [altEnKey, setAltEnKey] = useState<string>("none");
  const [addToHomepage, setAddToHomepage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [batch, setBatch] = useState<ImageRow[]>([]);
  const [stats, setStats] = useState<UploadStat[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  useEffect(() => {
    (async () => {
      const [c, s, t] = await Promise.all([
        supabase.from("gallery_categories").select("*").order("position"),
        supabase.from("gallery_stories").select("*").order("position"),
        supabase.from("alt_templates").select("*").order("key"),
      ]);
      if (c.data) setCategories(c.data);
      if (s.data) setStories(s.data);
      if (t.data) setTemplates(t.data);
      if (c.data?.[0]) setCategoryId(c.data[0].id);
    })();
  }, []);

  const categoryStories = useMemo(
    () => stories.filter((s) => s.category_id === categoryId && !s.is_system),
    [stories, categoryId]
  );

  const altRoOptions = useMemo(
    () => templates.filter((t) => t.language === "ro"),
    [templates]
  );
  const altEnOptions = useMemo(
    () => templates.filter((t) => t.language === "en"),
    [templates]
  );

  const templateBody = (key: string, lang: "ro" | "en"): string | null => {
    if (key === "none") return null;
    return templates.find((t) => t.key === key && t.language === lang)?.body ?? null;
  };

  async function resolveStoryId(): Promise<string> {
    if (storyChoice === "auto") {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) throw new Error("Category required");
      const defaultSlug = cat.slug + "-default";
      const { data, error } = await supabase
        .from("gallery_stories")
        .select("id")
        .eq("slug", defaultSlug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Default story missing");
      return data.id;
    }
    if (storyChoice === "new") {
      const title = newStoryTitle.trim();
      if (!title) throw new Error("New story title required");
      const slug = slugify(title) + "-" + Date.now().toString(36);
      const maxPos =
        Math.max(0, ...stories.filter((s) => s.category_id === categoryId).map((s) => s.position)) + 1000;
      const { data, error } = await supabase
        .from("gallery_stories")
        .insert({
          category_id: categoryId,
          slug,
          title_ro: title,
          title_en: title,
          position: maxPos,
          status: "published",
        })
        .select("*")
        .single();
      if (error) throw error;
      setStories((prev) => [...prev, data]);
      setStoryChoice(data.id);
      return data.id;
    }
    return storyChoice;
  }

  const onDrop = async (files: File[]) => {
    if (!files.length) return;
    if (!categoryId) return toast.error("Pick a category first");
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    try {
      const storyId = await resolveStoryId();
      // find current max position in that story
      const { data: maxRow } = await supabase
        .from("gallery_images")
        .select("position")
        .eq("story_id", storyId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      let pos = (maxRow?.position ?? 0) + 1000;

      const altRo = templateBody(altRoKey, "ro");
      const altEn = templateBody(altEnKey, "en");
      const uploadedRows: ImageRow[] = [];
      const newStats: UploadStat[] = [];

      for (const file of files) {
        try {
          // optimize first — only the optimized JPEG is ever stored
          const opt = await optimizeImage(file, file.name);
          const orientation = detectOrientationFrom(opt.optimized.width, opt.optimized.height);
          const path = `${crypto.randomUUID()}.jpg`;

          const up = await supabase.storage
            .from("gallery")
            .upload(path, opt.blob, { contentType: "image/jpeg" });
          if (up.error) throw up.error;

          const { data: row, error: insErr } = await supabase
            .from("gallery_images")
            .insert({
              story_id: storyId,
              storage_path: path,
              original_filename: file.name,
              width: opt.optimized.width,
              height: opt.optimized.height,
              orientation,
              file_size: opt.optimized.size,
              mime_type: "image/jpeg",
              position: pos,
              status,
              alt_ro: altRo,
              alt_en: altEn,
              uploaded_by: user?.id ?? null,
            })
            .select("*")
            .single();
          if (insErr) throw insErr;
          uploadedRows.push(row);
          newStats.push({
            name: file.name,
            original: { ...opt.original, size: file.size },
            optimized: opt.optimized,
          });
          pos += 1000;

          if (addToHomepage) {
            await supabase.from("homepage_featured").insert({
              image_id: row.id,
              position: pos,
            });
          }
        } catch (err: any) {
          toast.error(`Failed: ${file.name} — ${err.message ?? err}`);
        } finally {
          setProgress((p) => ({ ...p, done: p.done + 1 }));
        }
      }
      setBatch((prev) => [...uploadedRows, ...prev]);
      setStats((prev) => [...newStats, ...prev]);
      toast.success(`Uploaded ${uploadedRows.length} image(s)`);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const dz = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    disabled: uploading,
  });

  async function publishBatch() {
    const ids = batch.map((b) => b.id);
    if (!ids.length) return;
    const { error } = await supabase
      .from("gallery_images")
      .update({ status: "published" })
      .in("id", ids);
    if (error) return toast.error(error.message);
    setBatch((prev) => prev.map((b) => ({ ...b, status: "published" })));
    toast.success("Batch published");
  }

  async function updateAlt(id: string, field: "alt_ro" | "alt_en", value: string) {
    const patch = field === "alt_ro" ? { alt_ro: value } : { alt_en: value };
    const { error } = await supabase.from("gallery_images").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setBatch((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  async function toggleFavorite(row: ImageRow) {
    const next = !row.is_favorite;
    const { error } = await supabase
      .from("gallery_images")
      .update({ is_favorite: next })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    setBatch((prev) => prev.map((b) => (b.id === row.id ? { ...b, is_favorite: next } : b)));
  }

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-serif">Upload</h1>

      <Card>
        <CardHeader>
          <CardTitle>Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Story</Label>
            <Select value={storyChoice} onValueChange={setStoryChoice}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (default story)</SelectItem>
                <SelectItem value="new">Create new story…</SelectItem>
                {categoryStories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {storyChoice === "new" && (
            <div className="md:col-span-2">
              <Label>New story title</Label>
              <Input value={newStoryTitle} onChange={(e) => setNewStoryTitle(e.target.value)} placeholder="e.g. Ana & Mihai" />
            </div>
          )}
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusChoice)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch id="hf" checked={addToHomepage} onCheckedChange={setAddToHomepage} />
            <Label htmlFor="hf">Add to homepage featured</Label>
          </div>
          <div>
            <Label>Alt RO template</Label>
            <Select value={altRoKey} onValueChange={setAltRoKey}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {altRoOptions.map((t) => (
                  <SelectItem key={t.id} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Alt EN template</Label>
            <Select value={altEnKey} onValueChange={setAltEnKey}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {altEnOptions.map((t) => (
                  <SelectItem key={t.id} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Drop images</CardTitle></CardHeader>
        <CardContent>
          <div
            {...dz.getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${
              dz.isDragActive ? "bg-muted" : ""
            } ${uploading ? "opacity-50" : ""}`}
          >
            <input {...dz.getInputProps()} />
            {uploading
              ? "Uploading…"
              : dz.isDragActive
              ? "Drop the images here"
              : "Drag & drop images, or click to select"}
          </div>
        </CardContent>
      </Card>

      {batch.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Just uploaded ({batch.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBatch([])}>Clear batch</Button>
              <Button onClick={publishBatch}>Publish all in batch</Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batch.map((row) => {
              const missing =
                row.status === "published" && (!row.alt_ro || !row.alt_en);
              return (
                <div key={row.id} className="border rounded-md overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    <GalleryImage path={row.storage_path} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant="secondary">{row.status}</Badge>
                      {missing && <Badge variant="destructive">missing alt</Badge>}
                    </div>
                    <button
                      onClick={() => toggleFavorite(row)}
                      className={`absolute top-2 right-2 h-8 w-8 rounded-full text-lg flex items-center justify-center ${
                        row.is_favorite ? "bg-yellow-400" : "bg-black/50 text-white"
                      }`}
                      aria-label="favorite"
                    >
                      ★
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <Label className="text-xs">Alt RO</Label>
                      <Textarea
                        rows={2}
                        defaultValue={row.alt_ro ?? ""}
                        onBlur={(e) => updateAlt(row.id, "alt_ro", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Alt EN</Label>
                      <Textarea
                        rows={2}
                        defaultValue={row.alt_en ?? ""}
                        onBlur={(e) => updateAlt(row.id, "alt_en", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}