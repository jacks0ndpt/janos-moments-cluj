import { supabase } from "@/integrations/supabase/client";

export type UICategory = "weddings" | "events" | "couples";
export type PortfolioImage = {
  id: string | number;
  src: string;
  alt: string;
  category: UICategory;
  aspectRatio: "portrait" | "landscape";
};

const FLAG_KEY = "gallery.source";
export type GallerySource = "json" | "db";

/**
 * The database is the default source for everyone (first visit, incognito,
 * cleared storage). JSON is only used when an admin explicitly selects it.
 */
export function getGallerySource(): GallerySource {
  if (typeof window === "undefined") return "db";
  const v = window.localStorage.getItem(FLAG_KEY);
  return v === "json" ? "json" : "db";
}
export function setGallerySource(s: GallerySource) {
  if (typeof window !== "undefined") window.localStorage.setItem(FLAG_KEY, s);
}

// DB slug ↔ UI category mapping (URL/UI uses "events" for baptisms).
const DB_TO_UI: Record<string, UICategory> = {
  weddings: "weddings",
  baptisms: "events",
  couples: "couples",
};
export const UI_TO_DB: Record<UICategory, string> = {
  weddings: "weddings",
  events: "baptisms",
  couples: "couples",
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export function publicUrl(storagePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/gallery/${storagePath}`;
}

type JsonImage = {
  id: number;
  filename: string;
  alt: string;
  category: UICategory;
  aspectRatio: "portrait" | "landscape";
};

async function loadJson(): Promise<JsonImage[]> {
  const res = await fetch("/portfolio/images.json");
  const data = await res.json();
  return data.images ?? [];
}

function fromJson(i: JsonImage): PortfolioImage {
  return {
    id: i.id,
    src: `/portfolio/${i.filename}`,
    alt: i.alt,
    category: i.category,
    aspectRatio: i.aspectRatio,
  };
}

function aspectFromDims(w?: number | null, h?: number | null): "portrait" | "landscape" {
  if (!w || !h) return "landscape";
  return h > w ? "portrait" : "landscape";
}

type DbRow = {
  id: string;
  storage_path: string;
  alt_ro: string | null;
  alt_en: string | null;
  width: number | null;
  height: number | null;
  position: number;
  gallery_stories: {
    position: number;
    status: string;
    gallery_categories: { slug: string; status: string; position: number };
  };
};

async function loadDbAll(): Promise<PortfolioImage[]> {
  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, storage_path, alt_ro, alt_en, width, height, position, gallery_stories!gallery_images_story_id_fkey!inner(position, status, gallery_categories!inner(slug, status, position))"
    )
    .eq("status", "published")
    .eq("gallery_stories.status", "published")
    .eq("gallery_stories.gallery_categories.status", "published");
  if (error) throw error;
  const rows = (data ?? []) as unknown as DbRow[];
  rows.sort((a, b) => {
    const ca = a.gallery_stories.gallery_categories.position;
    const cb = b.gallery_stories.gallery_categories.position;
    if (ca !== cb) return ca - cb;
    const sa = a.gallery_stories.position;
    const sb = b.gallery_stories.position;
    if (sa !== sb) return sa - sb;
    return a.position - b.position;
  });
  return rows.map((r) => ({
    id: r.id,
    src: publicUrl(r.storage_path),
    alt: r.alt_ro ?? r.alt_en ?? "",
    category: DB_TO_UI[r.gallery_stories.gallery_categories.slug] ?? "weddings",
    aspectRatio: aspectFromDims(r.width, r.height),
  }));
}

export async function loadAllImages(): Promise<PortfolioImage[]> {
  if (getGallerySource() === "db") return loadDbAll();
  const json = await loadJson();
  return json.map(fromJson);
}

export async function loadCategoryImages(cat: UICategory): Promise<PortfolioImage[]> {
  const all = await loadAllImages();
  return all.filter((i) => i.category === cat);
}

export async function loadFeaturedImages(limit = 4): Promise<PortfolioImage[]> {
  if (getGallerySource() === "json") {
    const all = await loadAllImages();
    return all.slice(0, limit);
  }
  const { data, error } = await supabase
    .from("homepage_featured")
    .select(
      "position, gallery_images!inner(id, storage_path, alt_ro, alt_en, width, height, status, gallery_stories!gallery_images_story_id_fkey!inner(status, gallery_categories!inner(slug, status)))"
    )
    .order("position", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as any[];
  return rows
    .filter(
      (r) =>
        r.gallery_images?.status === "published" &&
        r.gallery_images.gallery_stories?.status === "published" &&
        r.gallery_images.gallery_stories.gallery_categories?.status === "published"
    )
    .slice(0, limit)
    .map((r) => ({
      id: r.gallery_images.id,
      src: publicUrl(r.gallery_images.storage_path),
      alt: r.gallery_images.alt_ro ?? r.gallery_images.alt_en ?? "",
      category:
        DB_TO_UI[r.gallery_images.gallery_stories.gallery_categories.slug] ?? "weddings",
      aspectRatio: aspectFromDims(r.gallery_images.width, r.gallery_images.height),
    }));
}