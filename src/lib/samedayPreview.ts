import { supabase } from "@/integrations/supabase/client";
import { publicUrl } from "@/lib/portfolioSource";
import type { Database } from "@/integrations/supabase/types";

export type PreviewRow = Database["public"]["Tables"]["same_day_previews"]["Row"];
export type PreviewImageRow =
  Database["public"]["Tables"]["same_day_preview_images"]["Row"];

export const PREVIEW_PREFIX = "previews";
export const DEFAULT_PREVIEW_MESSAGE = "A first look at your photographs.";
export const PREVIEW_CANONICAL_ORIGIN = "https://jimmyhada.com";
export const DEFAULT_CTA_LABEL = "Download photos";

export type ProjectType = Database["public"]["Enums"]["project_type"];
export type DeliveryMode = Database["public"]["Enums"]["delivery_mode"];

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "baptism", label: "Baptism" },
  { value: "event", label: "Event / Corporate" },
  { value: "portrait", label: "Portrait / Family" },
  { value: "other", label: "Other" },
];

export const DELIVERY_MODES: { value: DeliveryMode; label: string }[] = [
  { value: "preview", label: "Preview only" },
  { value: "full", label: "Full gallery only" },
  { value: "both", label: "Preview + Full gallery" },
];

export function projectTypeLabel(t: ProjectType | null | undefined) {
  return PROJECT_TYPES.find((p) => p.value === t)?.label ?? "Wedding";
}

export function deliveryModeLabel(m: DeliveryMode | null | undefined) {
  return DELIVERY_MODES.find((d) => d.value === m)?.label ?? "Preview only";
}

/** Small contextual overline shown on the public preview hero. */
export function previewOverline(t: ProjectType | null | undefined) {
  switch (t) {
    case "baptism":
      return "BAPTISM PREVIEW";
    case "event":
      return "EVENT PREVIEW";
    case "portrait":
      return "SESSION PREVIEW";
    case "other":
      return "PHOTO PREVIEW";
    default:
      return "WEDDING PREVIEW";
  }
}

/** Heading of the full-delivery section. */
export function deliveryHeading(t: ProjectType | null | undefined) {
  switch (t) {
    case "baptism":
      return "Your baptism photographs are ready.";
    case "event":
      return "Your event photographs are ready.";
    case "wedding":
      return "Your wedding photographs are ready.";
    default:
      return "Your photographs are ready.";
  }
}

export function formatAvailableUntil(date: string, locale = "en-GB") {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export function isValidHttpsUrl(value: string) {
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function previewImageUrl(storagePath: string) {
  return publicUrl(storagePath);
}

export function slugifyNames(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function randomSuffix(len = 4): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

/** Slug from the couple names plus a short random suffix, e.g. andreea-mihai-x7k4. */
export function buildSlug(coupleNames: string): string {
  const base = slugifyNames(coupleNames) || "preview";
  return `${base}-${randomSuffix()}`;
}

export function previewPublicPath(slug: string) {
  return `/preview/${slug}`;
}

export function previewPublicUrl(slug: string) {
  return `${PREVIEW_CANONICAL_ORIGIN}${previewPublicPath(slug)}`;
}

export function formatWeddingDate(date: string, locale = "en-GB"): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d
    .toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

/** Public fetch: a published preview and its ordered images. */
export async function fetchPublishedPreview(slug: string): Promise<{
  preview: PreviewRow;
  images: PreviewImageRow[];
} | null> {
  const { data: preview, error } = await supabase
    .from("same_day_previews")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!preview) return null;

  const { data: images, error: imgErr } = await supabase
    .from("same_day_preview_images")
    .select("*")
    .eq("preview_id", preview.id)
    .order("position", { ascending: true });
  if (imgErr) throw imgErr;

  return { preview, images: images ?? [] };
}

/** Removes storage objects for the given rows, ignoring already-missing files. */
export async function removePreviewFiles(paths: string[]) {
  if (!paths.length) return;
  const { error } = await supabase.storage.from("gallery").remove(paths);
  if (error) throw error;
}

/** Deletes a preview: storage objects first, then the row (images cascade). */
export async function deletePreview(previewId: string) {
  const { data: images, error } = await supabase
    .from("same_day_preview_images")
    .select("storage_path")
    .eq("preview_id", previewId);
  if (error) throw error;
  await removePreviewFiles((images ?? []).map((i) => i.storage_path)).catch(() => undefined);
  const { error: delErr } = await supabase
    .from("same_day_previews")
    .update({ cover_image_id: null })
    .eq("id", previewId);
  if (delErr) throw delErr;
  const { error: rowErr } = await supabase.from("same_day_previews").delete().eq("id", previewId);
  if (rowErr) throw rowErr;
}