import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { publicUrl } from '@/lib/portfolioSource';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type Row = {
  id: string;
  storage_path: string;
  original_filename: string | null;
  alt_en: string | null;
  alt_ro: string | null;
  story: { id: string; title_en: string; category_id: string } | null;
};

type Category = { id: string; slug: string; name_en: string };
type Story = { id: string; title_en: string; category_id: string };

const PAGE_SIZE = 24;

export function GalleryImagePicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (image: { id: string; storagePath: string; altEn: string; altRo: string }) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [storyId, setStoryId] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Load filters once, defaulting to Weddings (this page is wedding-focused).
  useEffect(() => {
    if (!open) return;
    (async () => {
      const [{ data: cats }, { data: sts }] = await Promise.all([
        supabase.from('gallery_categories').select('id, slug, name_en').order('position'),
        supabase.from('gallery_stories').select('id, title_en, category_id').order('position'),
      ]);
      setCategories(cats ?? []);
      setStories(sts ?? []);
      setCategoryId((prev) => prev || cats?.find((c) => c.slug === 'weddings')?.id || '');
    })();
  }, [open]);

  useEffect(() => {
    setRows([]);
    setPage(0);
    setDone(false);
  }, [categoryId, storyId, open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      let q = supabase
        .from('gallery_images')
        .select('id, storage_path, original_filename, alt_en, alt_ro, story:gallery_stories!gallery_images_story_id_fkey(id, title_en, category_id)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (storyId) q = q.eq('story_id', storyId);
      const { data } = await q;
      if (cancelled) return;
      let list = (data ?? []) as unknown as Row[];
      if (categoryId && !storyId) list = list.filter((r) => r.story?.category_id === categoryId);
      setRows((prev) => (page === 0 ? list : [...prev, ...list]));
      setDone((data ?? []).length < PAGE_SIZE);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, page, categoryId, storyId]);

  const filteredStories = useMemo(
    () => (categoryId ? stories.filter((s) => s.category_id === categoryId) : stories),
    [stories, categoryId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select an image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label htmlFor="picker-category" className="text-xs">Category</Label>
            <select
              id="picker-category"
              className="border rounded-md h-9 px-2 text-sm bg-background"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setStoryId('');
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_en}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="picker-story" className="text-xs">Story</Label>
            <select
              id="picker-story"
              className="border rounded-md h-9 px-2 text-sm bg-background"
              value={storyId}
              onChange={(e) => setStoryId(e.target.value)}
            >
              <option value="">All stories</option>
              {filteredStories.map((s) => (
                <option key={s.id} value={s.id}>{s.title_en}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-auto mt-2">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {rows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onSelect({
                    id: r.id,
                    storagePath: r.storage_path,
                    altEn: r.alt_en ?? '',
                    altRo: r.alt_ro ?? '',
                  });
                  onOpenChange(false);
                }}
                className="group relative aspect-square overflow-hidden rounded-md border hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary"
                title={r.original_filename ?? ''}
              >
                <img
                  src={publicUrl(r.storage_path)}
                  alt={r.alt_en ?? r.original_filename ?? ''}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          {!rows.length && !loading && (
            <p className="text-sm text-muted-foreground py-8 text-center">No published images match these filters.</p>
          )}
          {!done && (
            <div className="flex justify-center py-4">
              <Button variant="outline" size="sm" disabled={loading} onClick={() => setPage((p) => p + 1)}>
                {loading ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
