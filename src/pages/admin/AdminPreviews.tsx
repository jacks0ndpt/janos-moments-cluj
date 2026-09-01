import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_PREVIEW_MESSAGE,
  buildSlug,
  deletePreview,
  previewImageUrl,
  previewPublicPath,
  previewPublicUrl,
  type PreviewImageRow,
  type PreviewRow,
} from "@/lib/samedayPreview";

type Row = PreviewRow & { images: PreviewImageRow[] };

export default function AdminPreviews() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState(DEFAULT_PREVIEW_MESSAGE);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: previews, error }, { data: images }] = await Promise.all([
      supabase.from("same_day_previews").select("*").order("created_at", { ascending: false }),
      supabase
        .from("same_day_preview_images")
        .select("*")
        .order("position", { ascending: true }),
    ]);
    setLoading(false);
    if (error) return toast.error(error.message);
    const byPreview = new Map<string, PreviewImageRow[]>();
    for (const img of images ?? []) {
      const list = byPreview.get(img.preview_id) ?? [];
      list.push(img);
      byPreview.set(img.preview_id, list);
    }
    setRows((previews ?? []).map((p) => ({ ...p, images: byPreview.get(p.id) ?? [] })));
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    const coupleNames = names.trim();
    if (!coupleNames) return toast.error("Couple names are required");
    if (!date) return toast.error("Wedding date is required");
    setSaving(true);
    const { data, error } = await supabase
      .from("same_day_previews")
      .insert({
        couple_names: coupleNames,
        wedding_date: date,
        message: message.trim() || null,
        slug: buildSlug(coupleNames),
        created_by: user?.id ?? null,
      })
      .select("*")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setCreateOpen(false);
    setNames("");
    setDate("");
    setMessage(DEFAULT_PREVIEW_MESSAGE);
    navigate(`/admin/previews/${data.id}`);
  }

  async function copyLink(slug: string) {
    try {
      await navigator.clipboard.writeText(previewPublicUrl(slug));
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deletePreview(deleteTarget.id);
      toast.success("Preview deleted");
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Delete failed");
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-serif">Same Day Previews</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-2" /> Create Preview
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!loading && rows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">No Same Day Previews yet.</p>
            <Button onClick={() => setCreateOpen(true)}>Create your first preview</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rows.map((row) => {
          const cover =
            row.images.find((i) => i.id === row.cover_image_id) ?? row.images[0] ?? null;
          return (
            <Card key={row.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded bg-muted">
                  {cover && (
                    <img
                      src={previewImageUrl(cover.storage_path)}
                      alt={`${row.couple_names} cover`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{row.couple_names}</span>
                    <Badge variant={row.is_published ? "default" : "secondary"}>
                      {row.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.wedding_date} · {row.images.length} photo
                    {row.images.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {previewPublicUrl(row.slug)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={previewPublicPath(row.slug)} target="_blank">
                      <ExternalLink size={14} className="mr-1.5" /> View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/previews/${row.id}`}>
                      <Pencil size={14} className="mr-1.5" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyLink(row.slug)}>
                    <Copy size={14} className="mr-1.5" /> Copy Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete preview for ${row.couple_names}`}
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="names">Couple names</Label>
              <Input
                id="names"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="Andreea & Mihai"
              />
            </div>
            <div>
              <Label htmlFor="date">Wedding date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="msg">Short message (optional)</Label>
              <Textarea
                id="msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={saving}>
              {saving ? "Creating…" : "Create & add photos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this preview?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget?.couple_names} — {deleteTarget?.images.length ?? 0} photo(s) will be
            permanently removed from storage. The link will stop working. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
