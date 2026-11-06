export const SITE_ORIGIN = "https://jimmyhada.com";

type Lang = "ro" | "en";
type SeoStory = { slug: string; title_ro: string; title_en: string; venue: string | null; location: string | null; intro_ro: string | null; intro_en: string | null };

/** "[Title] - Nuntă la [Venue], [Location] | Jimmy Hada", omitting missing parts naturally. */
export function storySeoTitle(story: SeoStory, lang: Lang): string {
  const title = (lang === "ro" ? story.title_ro : story.title_en).trim();
  const place = [story.venue, story.location].map((p) => p?.trim()).filter(Boolean).join(", ");
  const lead = lang === "ro" ? "Nuntă la" : "Wedding at";
  return place ? `${title} - ${lead} ${place} | Jimmy Hada` : `${title} | Jimmy Hada`;
}

/** Clean one-line excerpt cut at a word boundary. */
export function excerpt(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 80 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

export function storySeoDescription(story: SeoStory, lang: Lang): string {
  const intro = (lang === "ro" ? story.intro_ro : story.intro_en)?.trim();
  if (intro) return excerpt(intro);
  const title = lang === "ro" ? story.title_ro : story.title_en;
  const place = [story.venue, story.location].filter(Boolean).join(", ");
  return lang === "ro"
    ? `${title}: o poveste de nuntă fotografiată documentar de Jimmy Hada${place ? ` la ${place}` : ""}.`
    : `${title}: a wedding story photographed in a documentary style by Jimmy Hada${place ? ` at ${place}` : ""}.`;
}

/** Alt fallback when no stored alt text exists; varies per photo position. */
export function storyImageAlt(story: SeoStory, lang: Lang, index: number, total: number): string {
  const title = lang === "ro" ? story.title_ro : story.title_en;
  const place = [story.venue, story.location].filter(Boolean)[0];
  if (index === 0) return lang === "ro" ? `${title}, fotografie de nuntă${place ? ` la ${place}` : ""}` : `${title}, wedding photograph${place ? ` at ${place}` : ""}`;
  return lang === "ro" ? `${title} — fotografia ${index + 1} din ${total}` : `${title} — photo ${index + 1} of ${total}`;
}

export function storyCanonical(slug: string): string {
  return `${SITE_ORIGIN}/stories/${encodeURIComponent(slug)}`;
}

/** Sitemap paths for Stories: published, non-system, with a slug. */
export function storySitemapPaths(stories: { slug: string | null; status: string; is_system?: boolean | null }[]): string[] {
  return stories.filter((s) => s.status === "published" && !s.is_system && s.slug).map((s) => `/stories/${s.slug}`);
}
