import { supabase } from "@/integrations/supabase/client";
import { publicUrl } from "@/lib/portfolioSource";
import {
  DEFAULT_CONTENT,
  DEFAULT_SEO,
  DEFAULT_SLOT,
  DEFAULT_SLOT_ALTS,
  EXPERIENCE_SLOTS,
  type ExperienceContent,
  type ExperienceSeo,
  type ExperienceSlot,
  type ExperienceSlotKey,
  type Lang,
} from "@/content/experience";

export type ExperienceConfig = {
  id: string | null;
  isEnabled: boolean;
  teaserEnabled: boolean;
  content: Record<Lang, ExperienceContent>;
  seo: Record<Lang, ExperienceSeo>;
  slots: Record<ExperienceSlotKey, ExperienceSlot>;
  updatedAt: string | null;
};

export type ResolvedImage = {
  id: string;
  src: string;
  width: number | null;
  height: number | null;
  available: boolean;
};

/** Deep-merge plain objects; arrays and scalars from `over` win when defined. */
function merge<T>(base: T, over: unknown): T {
  if (over === null || over === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (typeof base === "object" && base !== null && typeof over === "object" && !Array.isArray(over)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
      if (k in out) out[k] = merge((base as Record<string, unknown>)[k], v);
      else out[k] = v;
    }
    return out as T;
  }
  if (typeof over === "string" && over.trim() === "") return base;
  return over as T;
}

export function defaultSlots(): Record<ExperienceSlotKey, ExperienceSlot> {
  const out = {} as Record<ExperienceSlotKey, ExperienceSlot>;
  for (const key of EXPERIENCE_SLOTS) {
    out[key] = {
      ...DEFAULT_SLOT,
      focal: { ...DEFAULT_SLOT.focal },
      mobileFocal: { ...DEFAULT_SLOT.mobileFocal },
      altRo: DEFAULT_SLOT_ALTS[key].ro,
      altEn: DEFAULT_SLOT_ALTS[key].en,
    };
  }
  return out;
}

export function defaultConfig(): ExperienceConfig {
  return {
    id: null,
    isEnabled: true,
    teaserEnabled: true,
    content: JSON.parse(JSON.stringify(DEFAULT_CONTENT)),
    seo: JSON.parse(JSON.stringify(DEFAULT_SEO)),
    slots: defaultSlots(),
    updatedAt: null,
  };
}

/** Fetch the single Experience page settings record (falls back to defaults). */
export async function loadExperienceConfig(): Promise<ExperienceConfig> {
  const base = defaultConfig();
  const { data, error } = await supabase
    .from("experience_page")
    .select("id, is_enabled, teaser_enabled, content, seo, slots, updated_at")
    .limit(1)
    .maybeSingle();
  if (error || !data) return base;
  return {
    id: data.id,
    isEnabled: data.is_enabled,
    teaserEnabled: data.teaser_enabled,
    content: merge(base.content, data.content),
    seo: merge(base.seo, data.seo),
    slots: merge(base.slots, data.slots),
    updatedAt: data.updated_at,
  };
}

/**
 * Resolve only the referenced gallery images (never the whole gallery).
 * Archived/deleted/unpublished images resolve to `available: false` so the
 * public page can fall back gracefully and Admin can warn.
 */
export async function resolveImages(ids: (string | null | undefined)[]): Promise<Map<string, ResolvedImage>> {
  const unique = Array.from(new Set(ids.filter((id): id is string => !!id)));
  const out = new Map<string, ResolvedImage>();
  if (!unique.length) return out;
  const { data } = await supabase
    .from("gallery_images")
    .select("id, storage_path, width, height, status")
    .in("id", unique);
  for (const row of data ?? []) {
    out.set(row.id, {
      id: row.id,
      src: publicUrl(row.storage_path),
      width: row.width,
      height: row.height,
      available: row.status === "published",
    });
  }
  return out;
}

export function objectPosition(focal?: { x: number; y: number }) {
  const x = focal?.x ?? 50;
  const y = focal?.y ?? 50;
  return `${x}% ${y}%`;
}

export function slotAlt(slot: ExperienceSlot, language: Lang) {
  if (slot.decorative) return "";
  return (language === "ro" ? slot.altRo : slot.altEn) || slot.altEn || slot.altRo || "";
}

/** Language-aware Experience page path (default language has no prefix). */
export function experiencePath(language: Lang) {
  return language === "ro" ? "/experience" : "/experience";
}

/** Admin: persist the singleton Experience page record. */
export async function saveExperienceConfig(config: ExperienceConfig): Promise<ExperienceConfig> {
  const payload = {
    is_enabled: config.isEnabled,
    teaser_enabled: config.teaserEnabled,
    content: JSON.parse(JSON.stringify(config.content)),
    seo: JSON.parse(JSON.stringify(config.seo)),
    slots: JSON.parse(JSON.stringify(config.slots)),
    updated_at: new Date().toISOString(),
  };
  if (config.id) {
    const { data, error } = await supabase
      .from("experience_page")
      .update(payload)
      .eq("id", config.id)
      .select("id, updated_at")
      .single();
    if (error) throw error;
    return { ...config, id: data.id, updatedAt: data.updated_at };
  }
  const { data, error } = await supabase
    .from("experience_page")
    .insert(payload)
    .select("id, updated_at")
    .single();
  if (error) throw error;
  return { ...config, id: data.id, updatedAt: data.updated_at };
}
