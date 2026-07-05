import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["gallery_categories"]["Row"];
type GalleryStatus = Database["public"]["Enums"]["gallery_status"];

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  async function load() {
    const { data } = await supabase.from("gallery_categories").select("*").order("position");
    if (data) setCats(data);
  }
  useEffect(() => { load(); }, []);
  async function update(id: string, patch: Partial<Category>) {
    const { error } = await supabase.from("gallery_categories").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-serif">Categories</h1>
      {cats.map((c) => (
        <div key={c.id} className="border rounded p-3 flex flex-wrap items-center gap-3">
          <Input defaultValue={c.slug} className="w-32" onBlur={(e) => e.target.value !== c.slug && update(c.id, { slug: e.target.value })} />
          <Input defaultValue={c.name_ro} className="max-w-xs" onBlur={(e) => e.target.value !== c.name_ro && update(c.id, { name_ro: e.target.value })} />
          <Input defaultValue={c.name_en} className="max-w-xs" onBlur={(e) => e.target.value !== c.name_en && update(c.id, { name_en: e.target.value })} />
          <Select value={c.status} onValueChange={(v) => update(c.id, { status: v as GalleryStatus })}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}