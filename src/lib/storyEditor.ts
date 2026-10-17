import type { Database } from "@/integrations/supabase/types";

export type StoryRow = Database["public"]["Tables"]["gallery_stories"]["Row"];
export type StoryImageRow = Database["public"]["Tables"]["gallery_images"]["Row"];

export function canUseStoryCover(storyId: string, image: Pick<StoryImageRow, "story_id">): boolean {
  return image.story_id === storyId;
}

/** Only editorial fields are saved; category, image relationships and ordering stay untouched. */
export function storyEditorialPatch(story: StoryRow) {
  return {
    title_en: story.title_en.trim(),
    title_ro: story.title_ro.trim(),
    slug: story.slug.trim(),
    event_date: story.event_date || null,
    venue: story.venue?.trim() || null,
    location: story.location?.trim() || null,
    intro_en: story.intro_en?.trim() || null,
    intro_ro: story.intro_ro?.trim() || null,
    cover_image_id: story.cover_image_id,
    status: story.status,
  };
}