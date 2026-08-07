import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  GALLERY_BUCKET,
  detectOrientation,
  extOf,
  readImageDimensions,
} from "@/lib/gallery";
import {
  getGallerySource,
  setGallerySource,
  UI_TO_DB,
  type GallerySource,
  type UICategory,
} from "@/lib/portfolioSource";

type JsonImage = {
  id: number;
  filename: string;
  alt: string;
  category: UICategory;
  aspectRatio: "portrait" | "landscape";
};

type Report = {
  found: number;
  imported: number;
  skipped: number;
  failed: number;
  featured: number;
  perCategory: Record<string, number>;
  seconds: number;
  errors: string[];
};

const FEATURED_COUNT = 4;

export default function AdminImport() {
  const [source, setSourceState] = useState<GallerySource>("json");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const [log, setLog] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const [featuredCount, setFeaturedCount] = useState<number>(0);

  useEffect(() => {
    setSourceState(getGallerySource());
    refreshDbStats();
  }, []);

  async function refreshDbStats() {
    const { data: cats } = await supabase
      .from("gallery_categories")
      .select("slug");
    const counts: Record<string, number> = {};
    for (const c of cats ?? []) {
      const { count } = await supabase
        .from("gallery_images")
        .select("id, gallery_stories!inner(gallery_categories!inner(slug))", {
          count: "exact",
          head: true,
        })
        .eq("gallery_stories.gallery_categories.slug", c.slug);
      counts[c.slug] = count ?? 0;
    }
    setDbCounts(counts);
    const { count } = await supabase
      .from("homepage_featured")
      .select("id", { count: "exact", head: true });
    setFeaturedCount(count ?? 0);
  }

  function pushLog(msg: string) {
    setLog((l) => [...l.slice(-200), msg]);
  }

  async function runImport() {
    setBusy(true);
    setReport(null);
    setLog([]);
    const started = performance.now();
    const rep: Report = {
      found: 0,
      imported: 0,
      skipped: 0,
      failed: 0,
      featured: 0,
      perCategory: {},
      seconds: 0,
      errors: [],
    };
    try {
      const jsonRes = await fetch("/portfolio/images.json");
      const jsonData = await jsonRes.json();
      const images: JsonImage[] = jsonData.images ?? [];
      rep.found = images.length;
      setProgress({ done: 0, total: images.length });
      pushLog(`Found ${images.length} images in images.json`);

      // Load categories + default stories + templates
      const { data: cats, error: catsErr } = await supabase
        .from("gallery_categories")
        .select("id, slug");
      if (catsErr) throw catsErr;
      const catBySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));

      const { data: stories, error: sErr } = await supabase
        .from("gallery_stories")
        .select("id, slug, category_id");
      if (sErr) throw sErr;
      const defaultStoryByCatId = new Map<string, string>();
      for (const s of stories ?? []) {
        if (s.slug.endsWith("-default")) defaultStoryByCatId.set(s.category_id, s.id);
      }

      const { data: templates, error: tErr } = await supabase
        .from("alt_templates")
        .select("category_id, language, body");
      if (tErr) throw tErr;
      const tplByCatLang = new Map<string, string>();
      for (const t of templates ?? [])
        tplByCatLang.set(`${t.category_id}:${t.language}`, t.body);

      // Existing rows for idempotency: (story_id, original_filename)
      const { data: existing } = await supabase
        .from("gallery_images")
        .select("id, story_id, original_filename");
      const existingKey = new Set(
        (existing ?? []).map((r) => `${r.story_id}::${r.original_filename}`)
      );
      const existingIdByKey = new Map<string, string>(
        (existing ?? []).map((r) => [
          `${r.story_id}::${r.original_filename}`,
          r.id,
        ])
      );

      // Preserve JSON order → increasing position per category
      const positionByCat: Record<string, number> = {};
      // Featured = first FEATURED_COUNT images in JSON order (across all categories)
      const featuredJsonKeys = images
        .slice(0, FEATURED_COUNT)
        .map((i) => `${i.category}::${i.filename}`);
      const featuredImageIds: { key: string; id: string }[] = [];

      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        try {
          const dbSlug = UI_TO_DB[img.category];
          const categoryId = catBySlug.get(dbSlug);
          if (!categoryId) throw new Error(`no category for ${dbSlug}`);
          const storyId = defaultStoryByCatId.get(categoryId);
          if (!storyId) throw new Error(`no default story for ${dbSlug}`);

          const key = `${storyId}::${img.filename}`;
          const pos = (positionByCat[dbSlug] = (positionByCat[dbSlug] ?? 0) + 1000);
          rep.perCategory[dbSlug] = (rep.perCategory[dbSlug] ?? 0) + 1;

          if (existingKey.has(key)) {
            rep.skipped++;
            pushLog(`↷ skip (exists) ${img.filename}`);
            const existingId = existingIdByKey.get(key)!;
            const featuredKey = `${img.category}::${img.filename}`;
            if (featuredJsonKeys.includes(featuredKey))
              featuredImageIds.push({ key: featuredKey, id: existingId });
            setProgress({ done: idx + 1, total: images.length });
            continue;
          }

          // Fetch file
          const fileRes = await fetch(`/portfolio/${img.filename}`);
          if (!fileRes.ok) throw new Error(`fetch ${img.filename} → ${fileRes.status}`);
          const blob = await fileRes.blob();
          const file = new File([blob], img.filename, {
            type: blob.type || "image/jpeg",
          });

          const { width, height } = await readImageDimensions(file);
          const orientation = detectOrientation(width, height);

          // Upload storage
          const ext = extOf(img.filename);
          const storagePath = `${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from(GALLERY_BUCKET)
            .upload(storagePath, file, {
              contentType: file.type,
              cacheControl: "31536000",
              upsert: false,
            });
          if (upErr) throw upErr;

          const altRo =
            img.alt?.trim() ||
            tplByCatLang.get(`${categoryId}:ro`) ||
            "";
          const altEn = tplByCatLang.get(`${categoryId}:en`) || "";

          const { data: userData } = await supabase.auth.getUser();
          const { data: inserted, error: insErr } = await supabase
            .from("gallery_images")
            .insert({
              story_id: storyId,
              storage_path: storagePath,
              original_filename: img.filename,
              width,
              height,
              orientation,
              file_size: file.size,
              position: pos,
              status: "published",
              alt_ro: altRo,
              alt_en: altEn,
              uploaded_by: userData.user?.id ?? null,
            })
            .select("id")
            .single();
          if (insErr) throw insErr;

          rep.imported++;
          pushLog(`✓ ${img.filename} (${width}×${height}, ${orientation})`);
          const featuredKey = `${img.category}::${img.filename}`;
          if (featuredJsonKeys.includes(featuredKey))
            featuredImageIds.push({ key: featuredKey, id: inserted.id });
        } catch (e: any) {
          rep.failed++;
          const msg = e?.message ?? String(e);
          rep.errors.push(`${img.filename}: ${msg}`);
          pushLog(`✗ ${img.filename} — ${msg}`);
        }
        setProgress({ done: idx + 1, total: images.length });
      }

      // Rebuild homepage_featured
      await supabase.from("homepage_featured").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const orderedFeatured = featuredJsonKeys
        .map((k) => featuredImageIds.find((f) => f.key === k)?.id)
        .filter((v): v is string => !!v);
      for (let i = 0; i < orderedFeatured.length; i++) {
        const { error } = await supabase
          .from("homepage_featured")
          .insert({ image_id: orderedFeatured[i], position: (i + 1) * 1000 });
        if (error) {
          rep.errors.push(`featured ${i}: ${error.message}`);
          pushLog(`✗ featured ${i} — ${error.message}`);
        } else {
          rep.featured++;
        }
      }

      rep.seconds = (performance.now() - started) / 1000;
      setReport(rep);
      await refreshDbStats();
      toast.success(`Import finished in ${rep.seconds.toFixed(1)}s`);
    } catch (e: any) {
      toast.error(e?.message ?? "Import failed");
      pushLog(`FATAL: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  }

  function flip(next: GallerySource) {
    setGallerySource(next);
    setSourceState(next);
    toast.success(`Public gallery is now reading from ${next.toUpperCase()}`);
  }

  const pct = useMemo(
    () => (progress.total ? Math.round((progress.done / progress.total) * 100) : 0),
    [progress]
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif">Import & migration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          One-time migration from <code>public/portfolio/images.json</code> into the
          database-backed gallery. Safe to re-run — images with the same filename
          in the same story are skipped.
        </p>
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Public gallery source</div>
            <div className="text-xs text-muted-foreground">
              The database is the default for every visitor. JSON is a rollback/testing
              option and only applies to your own browser when selected here.
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={source === "json" ? "default" : "outline"}
              size="sm"
              onClick={() => flip("json")}
            >
              JSON (legacy)
            </Button>
            <Button
              variant={source === "db" ? "default" : "outline"}
              size="sm"
              onClick={() => flip("db")}
            >
              Database
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Run import</div>
          <Button onClick={runImport} disabled={busy}>
            {busy ? "Importing…" : "Start import"}
          </Button>
        </div>
        {busy && (
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {progress.done} / {progress.total} ({pct}%)
            </div>
          </div>
        )}
      </div>

      {report && (
        <div className="border rounded p-4 space-y-2">
          <div className="font-medium">Migration summary</div>
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Images found</dt>
            <dd>{report.found}</dd>
            <dt className="text-muted-foreground">Imported</dt>
            <dd>{report.imported}</dd>
            <dt className="text-muted-foreground">Skipped</dt>
            <dd>{report.skipped}</dd>
            <dt className="text-muted-foreground">Failed</dt>
            <dd>{report.failed}</dd>
            <dt className="text-muted-foreground">Homepage featured</dt>
            <dd>{report.featured}</dd>
            <dt className="text-muted-foreground">Finished in</dt>
            <dd>{report.seconds.toFixed(1)} s</dd>
          </dl>
          <div className="pt-2">
            <div className="text-xs uppercase text-muted-foreground mb-1">
              Per category (this run)
            </div>
            {Object.entries(report.perCategory).map(([k, v]) => (
              <div key={k} className="text-sm flex justify-between">
                <span className="capitalize">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          {report.errors.length > 0 && (
            <details className="pt-2">
              <summary className="text-sm text-destructive cursor-pointer">
                {report.errors.length} error(s)
              </summary>
              <ul className="text-xs mt-2 space-y-1">
                {report.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="border rounded p-4 space-y-2">
        <div className="font-medium">Current DB state</div>
        <div className="text-sm flex justify-between">
          <span>Homepage featured</span>
          <span>{featuredCount}</span>
        </div>
        {Object.entries(dbCounts).map(([k, v]) => (
          <div key={k} className="text-sm flex justify-between">
            <span className="capitalize">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <details className="border rounded p-4">
          <summary className="cursor-pointer font-medium text-sm">Log</summary>
          <pre className="text-xs mt-2 max-h-80 overflow-auto whitespace-pre-wrap">
            {log.join("\n")}
          </pre>
        </details>
      )}

      <div className="border rounded p-4 text-xs text-muted-foreground space-y-2">
        <div className="font-medium text-foreground">Rollback</div>
        <p>
          The legacy JSON file <code>public/portfolio/images.json</code> and all
          files under <code>public/portfolio/</code> are preserved. To revert the
          public site, switch the source above back to <strong>JSON (legacy)</strong>.
          No data is destroyed by that flip — DB rows remain and can be re-enabled
          at any time.
        </p>
      </div>
    </div>
  );
}