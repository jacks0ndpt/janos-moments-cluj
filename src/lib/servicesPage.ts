import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_CONTENT,
  DEFAULT_SEO,
  DEFAULT_SLOT,
  DEFAULT_SLOT_ALTS,
  REVIEWS,
  SERVICES_SECTIONS,
  SERVICES_SLOTS,
  type Lang,
  type Review,
  type ServicesContent,
  type ServicesSectionKey,
  type ServicesSeo,
  type ServicesSlot,
  type ServicesSlotKey,
} from "@/content/servicesPage";

export type ServicesConfig = {
  id: string | null;
  isEnabled: boolean;
  sectionsEnabled: Record<ServicesSectionKey, boolean>;
  content: Record<Lang, ServicesContent>;
  seo: Record<Lang, ServicesSeo>;
  media: Record<ServicesSlotKey, ServicesSlot>;
  sectionOrder: ServicesSectionKey[];
  updatedAt: string | null;
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

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function defaultMedia(): Record<ServicesSlotKey, ServicesSlot> {
  const out = {} as Record<ServicesSlotKey, ServicesSlot>;
  for (const key of SERVICES_SLOTS) {
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

export function defaultSectionsEnabled(): Record<ServicesSectionKey, boolean> {
  const out = {} as Record<ServicesSectionKey, boolean>;
  for (const key of SERVICES_SECTIONS) out[key] = true;
  return out;
}

export function defaultServicesConfig(): ServicesConfig {
  return {
    id: null,
    isEnabled: true,
    sectionsEnabled: defaultSectionsEnabled(),
    content: clone(DEFAULT_CONTENT),
    seo: clone(DEFAULT_SEO),
    media: defaultMedia(),
    sectionOrder: [...SERVICES_SECTIONS],
    updatedAt: null,
  };
}

/** Keep only known keys, in a valid order, with nothing missing. */
function safeOrder(value: unknown): ServicesSectionKey[] {
  const raw = Array.isArray(value) ? value : [];
  const seen = new Set<ServicesSectionKey>();
  const out: ServicesSectionKey[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const key = item as ServicesSectionKey;
    if (SERVICES_SECTIONS.includes(key) && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  for (const key of SERVICES_SECTIONS) if (!seen.has(key)) out.push(key);
  return out;
}

/**
 * Load the singleton Services page configuration.
 * Any failure (missing row, network error, malformed JSON) falls back to the
 * approved local defaults so the page never renders empty.
 */
export async function loadServicesConfig(): Promise<ServicesConfig> {
  const base = defaultServicesConfig();
  try {
    const { data, error } = await supabase
      .from("services_page")
      .select("id, is_enabled, content, media, seo, section_order, updated_at")
      .limit(1)
      .maybeSingle();
    if (error || !data) return base;
    const content = (data.content ?? {}) as Record<string, unknown>;
    return {
      id: data.id,
      isEnabled: data.is_enabled,
      sectionsEnabled: merge(base.sectionsEnabled, content.sectionsEnabled),
      content: merge(base.content, { ro: content.ro, en: content.en }),
      seo: merge(base.seo, data.seo),
      media: merge(base.media, data.media),
      sectionOrder: safeOrder(data.section_order),
      updatedAt: data.updated_at,
    };
  } catch {
    return base;
  }
}

/** Admin: persist the singleton Services page record. */
export async function saveServicesConfig(config: ServicesConfig): Promise<ServicesConfig> {
  const payload = {
    is_enabled: config.isEnabled,
    content: clone({
      ro: config.content.ro,
      en: config.content.en,
      sectionsEnabled: config.sectionsEnabled,
    }),
    media: clone(config.media),
    seo: clone(config.seo),
    section_order: clone(config.sectionOrder),
    updated_at: new Date().toISOString(),
  };
  if (config.id) {
    const { data, error } = await supabase
      .from("services_page")
      .update(payload)
      .eq("id", config.id)
      .select("id, updated_at")
      .single();
    if (error) throw error;
    return { ...config, id: data.id, updatedAt: data.updated_at };
  }
  const { data, error } = await supabase
    .from("services_page")
    .insert(payload)
    .select("id, updated_at")
    .single();
  if (error) throw error;
  return { ...config, id: data.id, updatedAt: data.updated_at };
}

/** Featured reviews resolved from ids, preserving the configured order. */
export function featuredReviews(ids: string[] | undefined, fallbackCount = 2): Review[] {
  const list = (ids ?? [])
    .map((id) => REVIEWS.find((r) => r.id === id))
    .filter((r): r is Review => !!r);
  return list.length ? list : REVIEWS.slice(0, fallbackCount);
}

export function slotAlt(slot: ServicesSlot | undefined, language: Lang) {
  if (!slot) return "";
  return (language === "ro" ? slot.altRo : slot.altEn) || slot.altEn || slot.altRo || "";
}
