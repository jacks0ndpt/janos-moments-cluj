import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Story = Database["public"]["Tables"]["gallery_stories"]["Row"];
type Category = Database["public"]["Tables"]["gallery_categories"]["Row"];
type GalleryStatus = Database["public"]["Enums"]["gallery_status"];

export default function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  async function load() {
    const [s, c] = await Promise.all([
      supabase.from("gallery_stories").select("*").order("position"),
      supabase.from("gallery_categories").select("*").order("position"),
    ]);
    if (s.data) setStories(s.data);
    if (c.data) setCategories(c.data);
  }
  useEffect(() => { load(); }, []);

  async function updateStory(id: string, patch: Partial<Story>) {
    const { error } = await supabase.from("gallery_stories").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function publishAllInStory(storyId: string, status: GalleryStatus) {
    const { error } = await supabase.from("gallery_images").update({ status }).eq("story_id", storyId);
    if (error) return toast.error(error.message);
    toast.success(`All images set to ${status}`);
  }

  const catName = (id: string) => categories.find((c) => c.id === id)?.name_en ?? "—";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-serif">Stories</h1>
      <div className="space-y-2">
        {stories.map((s) => (
          <div key={s.id} className={`border rounded p-3 flex flex-wrap items-center gap-3 ${s.is_system ? "opacity-70" : ""}`}>
            <Input
              defaultValue={s.title_en}
              className="max-w-xs"
              onBlur={(e) => e.target.value !== s.title_en && updateStory(s.id, { title_en: e.target.value })}
            />
            <Input
              defaultValue={s.title_ro}
              className="max-w-xs"
              onBlur={(e) => e.target.value !== s.title_ro && updateStory(s.id, { title_ro: e.target.value })}
            />
            <span className="text-sm text-muted-foreground">{catName(s.category_id)}</span>
            {s.is_system && <Badge variant="outline">default</Badge>}
            <Select value={s.status} onValueChange={(v) => updateStory(s.id, { status: v as GalleryStatus })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => publishAllInStory(s.id, "published")}>Publish all images</Button>
              <Button size="sm" variant="outline" onClick={() => publishAllInStory(s.id, "archived")}>Archive all images</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}