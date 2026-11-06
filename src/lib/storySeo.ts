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

/** Sitemap paths for Stories: published with a slug. */
export function storySitemapPaths(stories: { slug: string | null; status: string; is_system?: boolean | null }[]): string[] {
  return stories.filter((s) => s.status === "published" && s.slug).map((s) => `/stories/${s.slug}`);
}

const STATIC_SELECTORS = 'link[rel="canonical"], meta[name="description"], meta[property="og:image"], meta[property="og:image:width"], meta[property="og:image:height"], meta[property="og:image:alt"], meta[name="twitter:image"], meta[property="og:title"], meta[property="og:description"], meta[property="og:url"], meta[name="twitter:title"], meta[name="twitter:description"]';

/** Temporarily detaches the sitewide index.html head tags (not managed by Helmet) so Story pages expose a single canonical/description/image. Restored on unmount. */
export function detachStaticHeadTags(): () => void {
  const nodes = [...document.head.querySelectorAll<HTMLElement>(STATIC_SELECTORS)].filter((n) => !n.hasAttribute("data-rh"));
  const marker = document.createComment("static-head");
  const placed = nodes.map((n) => { const m = marker.cloneNode() as Comment; n.replaceWith(m); return [n, m] as const; });
  return () => placed.forEach(([n, m]) => m.replaceWith(n));
}
