import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GalleryImage } from "@/components/admin/GalleryImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { canUseStoryCover, storyEditorialPatch, type StoryRow, type StoryImageRow } from "@/lib/storyEditor";
import { toast } from "sonner";

export default function AdminStoryEdit() {
  const { id } = useParams();
  const { language } = useLanguage();
  const text = (en: string, ro: string) => language === "ro" ? ro : en;
  const [story, setStory] = useState<StoryRow | null>(null);
  const [images, setImages] = useState<StoryImageRow[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      supabase.from("gallery_stories").select("*").eq("id", id).maybeSingle(),
      supabase.from("gallery_images").select("*").eq("story_id", id).order("position"),
      supabase.from("gallery_categories").select("id, name_en, name_ro"),
    ]).then(([s, imgs, cats]) => {
      if (cancelled) return;
      setLoading(false);
      const failure = s.error || imgs.error || cats.error;
      if (failure) return setError(failure.message);
      setStory(s.data);
      setImages(imgs.data ?? []);
      const cat = cats.data?.find((c) => c.id === s.data?.category_id);
      setCategory(cat ? (language === "ro" ? cat.name_ro : cat.name_en) : "—");
    });
    return () => { cancelled = true; };
  }, [id, language]);

  function edit(patch: Partial<StoryRow>) {
    setStory((current) => current ? { ...current, ...patch } : current);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!story || saving) return;
    const fields = storyEditorialPatch(story);
    if (!fields.title_en || !fields.title_ro || !fields.slug) {
      return toast.error(text("Both titles and slug are required.", "Ambele titluri și slug-ul sunt obligatorii."));
    }
    setSaving(true);
    const result = await supabase.from("gallery_stories").update(fields).eq("id", story.id).select("*").single();
    setSaving(false);
    if (result.error) return toast.error(result.error.message);
    setStory(result.data);
    toast.success(text("Story saved", "Poveste salvată"));
  }

  async function setImageStatus(status: "published" | "archived") {
    if (!story || bulkBusy) return;
    setBulkBusy(true);
    const result = await supabase.from("gallery_images").update({ status }).eq("story_id", story.id);
    setBulkBusy(false);
    if (result.error) return toast.error(result.error.message);
    setImages((current) => current.map((image) => ({ ...image, status })));
    toast.success(status === "published" ? text("All images published", "Toate fotografiile publicate") : text("All images archived", "Toate fotografiile arhivate"));
  }

  const back = <Button asChild variant="ghost" size="sm"><Link to="/admin/stories"><ArrowLeft size={16} className="mr-2" />{text("Stories", "Povești")}</Link></Button>;
  if (loading) return <p className="text-muted-foreground">{text("Loading…", "Se încarcă…")}</p>;
  if (error || !story) return <div className="space-y-4">{back}<p role="alert">{error || text("Story not found.", "Povestea nu a fost găsită.")}</p></div>;

  return (
    <div className="max-w-5xl space-y-6 min-w-0">
      <header className="space-y-3">
        {back}
        <h1 className="text-2xl font-serif break-words">{text("Edit story", "Editează povestea")}</h1>
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground"><span>{text("Category", "Categorie")}: {category}</span>{story.is_system && <Badge variant="outline">{text("default", "implicită")}</Badge>}</div>
      </header>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        <div className="space-y-1 min-w-0"><Label htmlFor="story-title-en">{text("Story title (EN)", "Titlu poveste (EN)")}</Label><Input id="story-title-en" required value={story.title_en} onChange={(e) => edit({ title_en: e.target.value })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-title-ro">{text("Story title (RO)", "Titlu poveste (RO)")}</Label><Input id="story-title-ro" required value={story.title_ro} onChange={(e) => edit({ title_ro: e.target.value })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-slug">Slug</Label><Input id="story-slug" required value={story.slug} onChange={(e) => edit({ slug: e.target.value })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-date">{text("Event date", "Data evenimentului")}</Label><Input id="story-date" type="date" value={story.event_date ?? ""} onChange={(e) => edit({ event_date: e.target.value || null })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-venue">{text("Venue", "Locație eveniment")}</Label><Input id="story-venue" value={story.venue ?? ""} onChange={(e) => edit({ venue: e.target.value })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-location">{text("Location", "Localitate")}</Label><Input id="story-location" value={story.location ?? ""} onChange={(e) => edit({ location: e.target.value })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-intro-en">{text("Short intro (EN)", "Introducere scurtă (EN)")}</Label><Textarea id="story-intro-en" rows={4} value={story.intro_en ?? ""} onChange={(e) => edit({ intro_en: e.target.value })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-intro-ro">{text("Short intro (RO)", "Introducere scurtă (RO)")}</Label><Textarea id="story-intro-ro" rows={4} value={story.intro_ro ?? ""} onChange={(e) => edit({ intro_ro: e.target.value })} /></div>
        <div className="space-y-1 min-w-0"><Label htmlFor="story-status">{text("Status", "Stare")}</Label><Select value={story.status} onValueChange={(value) => edit({ status: value as StoryRow["status"] })}><SelectTrigger id="story-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">{text("Draft", "Ciornă")}</SelectItem><SelectItem value="published">{text("Published", "Publicat")}</SelectItem><SelectItem value="archived">{text("Archived", "Arhivat")}</SelectItem></SelectContent></Select></div>
        <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={saving}><Save size={16} className="mr-2" />{saving ? text("Saving…", "Se salvează…") : text("Save story", "Salvează povestea")}</Button></div>
      </form>
      <section className="space-y-3 border-t pt-6">
        <h2 className="text-xl">{text("Cover image", "Fotografie de copertă")}</h2>
        {story.cover_image_id ? <div className="space-y-2"><GalleryImage path={images.find((image) => image.id === story.cover_image_id)?.storage_path ?? ""} className="w-full max-w-md aspect-[3/2] object-cover rounded" alt={story.title_en} /><Button variant="outline" size="sm" onClick={() => edit({ cover_image_id: null })}>{text("Remove cover", "Elimină coperta")}</Button></div> : <p className="text-sm text-muted-foreground">{text("No cover selected", "Nicio copertă selectată")}</p>}
      </section>
      <section className="space-y-4 border-t pt-6">
        <div className="flex flex-wrap justify-between items-center gap-3"><h2 className="text-xl">{text("Story images", "Fotografiile poveștii")} ({images.length})</h2><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={bulkBusy || !images.length} onClick={() => setImageStatus("published")}>{text("Publish all images", "Publică toate fotografiile")}</Button><Button variant="outline" size="sm" disabled={bulkBusy || !images.length} onClick={() => setImageStatus("archived")}>{text("Archive all images", "Arhivează toate fotografiile")}</Button></div></div>
        {!images.length && <p className="text-sm text-muted-foreground">{text("No images in this story.", "Această poveste nu are fotografii.")}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image) => <div key={image.id} className="min-w-0 space-y-2"><Button type="button" variant="ghost" className="relative p-0 w-full h-auto aspect-square overflow-hidden border rounded" aria-label={`${text("Use as cover", "Folosește drept copertă")}: ${image.original_filename ?? image.id}`} aria-pressed={story.cover_image_id === image.id} onClick={() => { if (canUseStoryCover(story.id, image)) edit({ cover_image_id: image.id }); }}><GalleryImage path={image.storage_path} alt={(language === "ro" ? image.alt_ro : image.alt_en) ?? image.original_filename ?? ""} className="h-full w-full object-cover" />{story.cover_image_id === image.id && <span className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1"><Check size={16} /></span>}</Button><div className="flex flex-wrap gap-1 items-center"><Badge variant="outline">{image.status === "published" ? text("Published", "Publicat") : image.status === "archived" ? text("Archived", "Arhivat") : text("Draft", "Ciornă")}</Badge>{story.cover_image_id === image.id && <span className="text-xs text-muted-foreground">{text("Cover", "Copertă")}</span>}</div></div>)}
        </div>
      </section>
    </div>
  );
}