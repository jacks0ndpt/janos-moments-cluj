import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { GalleryImage } from "@/components/admin/GalleryImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { emptyStoryPatch, type StoryRow } from "@/lib/storyEditor";
import { deleteStory } from "@/lib/storyManagement";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminStories() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = (en: string, ro: string) => language === "ro" ? ro : en;
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name_en: string; name_ro: string }[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, c] = await Promise.all([
        supabase.from("gallery_stories").select("*").order("position"),
        supabase.from("gallery_categories").select("id, name_en, name_ro").order("position"),
      ]);
      if (cancelled) return;
      if (s.error || c.error) { setError(s.error?.message ?? c.error?.message ?? ""); setLoading(false); return; }
      setStories(s.data ?? []);
      setCategories(c.data ?? []);
      setCategoryId(c.data?.[0]?.id ?? "");
      const ids = (s.data ?? []).flatMap((story) => story.cover_image_id ? [story.cover_image_id] : []);
      if (ids.length) {
        const result = await supabase.from("gallery_images").select("id, storage_path").in("id", ids);
        if (cancelled) return;
        setCovers(Object.fromEntries((result.data ?? []).map((image) => [image.id, image.storage_path])));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function addStory() {
    if (!categoryId || busy) return;
    setBusy(true);
    const position = Math.max(0, ...stories.filter((s) => s.category_id === categoryId).map((s) => s.position)) + 1000;
    const result = await supabase.from("gallery_stories").insert(emptyStoryPatch(categoryId, `story-${crypto.randomUUID()}`, position)).select("id").single();
    setBusy(false);
    if (result.error) return toast.error(result.error.message);
    navigate(`/admin/stories/${result.data.id}`);
  }

  async function removeStory(story: StoryRow) {
    if (busy || story.is_system || !window.confirm(text("Delete this Story and all its photos permanently?", "Ștergi definitiv această poveste și toate fotografiile ei?"))) return;
    setBusy(true);
    try {
      await deleteStory(story.id);
      setStories((current) => current.filter((item) => item.id !== story.id));
      toast.success(text("Story deleted", "Poveste ștearsă"));
    } catch (failure) { toast.error(failure instanceof Error ? failure.message : String(failure)); }
    finally { setBusy(false); }
  }

  return <div className="max-w-5xl space-y-4 min-w-0">
    <h1 className="text-2xl font-serif">{text("Stories", "Povești")}</h1>
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-56 space-y-1"><Label htmlFor="new-story-category">{text("Category", "Categorie")}</Label><Select value={categoryId} onValueChange={setCategoryId} disabled={busy || loading}><SelectTrigger id="new-story-category"><SelectValue /></SelectTrigger><SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{language === "ro" ? cat.name_ro : cat.name_en}</SelectItem>)}</SelectContent></Select></div>
      <Button disabled={busy || loading || !categoryId} onClick={addStory}><Plus size={16} className="mr-2" />{text("Add Story", "Adaugă poveste")}</Button>
    </div>
    {loading && <p className="text-muted-foreground">{text("Loading…", "Se încarcă…")}</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {!loading && !error && !stories.length && <p className="text-muted-foreground">{text("No stories yet.", "Nu există povești încă.")}</p>}
    <div className="divide-y border-y">
      {stories.map((story) => {
        const cat = categories.find((category) => category.id === story.category_id);
        const coverPath = story.cover_image_id ? covers[story.cover_image_id] : undefined;
        return <div key={story.id} className="flex items-center gap-2"><Link to={`/admin/stories/${story.id}`} className="min-w-0 flex-1 flex items-center gap-3 py-4 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          {coverPath && <GalleryImage path={coverPath} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded shrink-0" />}
          <div className="min-w-0 flex-1 space-y-1"><h2 className="text-xl break-words">{language === "ro" ? story.title_ro : story.title_en}</h2><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground"><span>{cat ? (language === "ro" ? cat.name_ro : cat.name_en) : "—"}</span>{story.event_date && <span>{new Date(`${story.event_date}T12:00:00`).toLocaleDateString(language === "ro" ? "ro-RO" : "en-GB")}</span>}<Badge variant="outline">{story.status === "published" ? text("Published", "Publicat") : story.status === "archived" ? text("Archived", "Arhivat") : text("Draft", "Ciornă")}</Badge>{story.is_system && <Badge variant="outline">{text("default", "implicită")}</Badge>}</div></div>
          <ArrowRight size={18} className="shrink-0 text-muted-foreground" />
        </Link>{!story.is_system && <Button variant="ghost" size="icon" disabled={busy} aria-label={`${text("Delete Story", "Șterge povestea")}: ${language === "ro" ? story.title_ro : story.title_en}`} title={text("Delete Story", "Șterge povestea")} onClick={() => removeStory(story)}><Trash2 size={16} className="text-destructive" /></Button>}</div>;
      })}
    </div>
  </div>;
}