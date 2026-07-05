import { supabase } from "@/integrations/supabase/client";

const BUCKET = "gallery";
const urlCache = new Map<string, { url: string; expires: number }>();

/** Get a long-lived signed URL for a gallery storage path, cached in memory. */
export async function getSignedUrl(path: string): Promise<string> {
  const cached = urlCache.get(path);
  if (cached && cached.expires > Date.now() + 60_000) return cached.url;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 1 week
  if (error || !data) throw error ?? new Error("signed url failed");
  urlCache.set(path, { url: data.signedUrl, expires: Date.now() + 6.5 * 24 * 60 * 60 * 1000 });
  return data.signedUrl;
}

export async function getSignedUrls(paths: string[]): Promise<Record<string, string>> {
  const need: string[] = [];
  const result: Record<string, string> = {};
  const now = Date.now();
  for (const p of paths) {
    const cached = urlCache.get(p);
    if (cached && cached.expires > now + 60_000) result[p] = cached.url;
    else need.push(p);
  }
  if (need.length) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(need, 60 * 60 * 24 * 7);
    if (error) throw error;
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) {
        urlCache.set(item.path, {
          url: item.signedUrl,
          expires: now + 6.5 * 24 * 60 * 60 * 1000,
        });
        result[item.path] = item.signedUrl;
      }
    }
  }
  return result;
}

export type Orientation = "landscape" | "portrait" | "square";

export function detectOrientation(w: number, h: number): Orientation {
  if (w === h) return "square";
  return w > h ? "landscape" : "portrait";
}

export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return (m?.[1] ?? "jpg").toLowerCase();
}

export const GALLERY_BUCKET = BUCKET;