import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Template = Database["public"]["Tables"]["alt_templates"]["Row"];

export default function AdminAltTemplates() {
  const [rows, setRows] = useState<Template[]>([]);
  useEffect(() => {
    supabase.from("alt_templates").select("*").order("key").then(({ data }) => data && setRows(data));
  }, []);
  async function update(id: string, patch: Partial<Template>) {
    const { error } = await supabase.from("alt_templates").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  }
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-serif">Alt templates</h1>
      {rows.map((r) => (
        <div key={r.id} className="border rounded p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <Input defaultValue={r.label} className="max-w-xs" onBlur={(e) => update(r.id, { label: e.target.value })} />
            <span className="text-xs text-muted-foreground">{r.language.toUpperCase()} · {r.key}</span>
          </div>
          <Textarea defaultValue={r.body} rows={2} onBlur={(e) => update(r.id, { body: e.target.value })} />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Changes save on blur.</p>
    </div>
  );
}