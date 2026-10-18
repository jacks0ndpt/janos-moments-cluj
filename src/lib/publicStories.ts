import { supabase } from "@/integrations/supabase/client";
import type { StoryRow } from "@/lib/storyEditor";

export type PublicStory = Pick<StoryRow, "id" | "slug" | "title_en" | "title_ro" | "venue" | "location" | "event_date" | "cover_image_id"> & {
  cover: { storage_path: string; alt_en: string | null; alt_ro: string | null } | null;
};

export function publishedStories<T extends { status: string }>(stories: T[]): T[] {
  return stories.filter((story) => story.status === "published");
}

export async function loadPublicStories(): Promise<PublicStory[]> {
  const result = await supabase.from("gallery_stories")
    .select("id, slug, title_en, title_ro, venue, location, event_date, cover_image_id, status")
    .eq("status", "published").order("position");
  if (result.error) throw result.error;
  const stories = publishedStories(result.data ?? []);
  const coverIds = [...new Set(stories.flatMap((story) => story.cover_image_id ? [story.cover_image_id] : []))];
  if (!coverIds.length) return stories.map((story) => ({ ...story, cover: null }));
  const covers = await supabase.from("gallery_images")
    .select("id, storage_path, alt_en, alt_ro").in("id", coverIds);
  if (covers.error) throw covers.error;
  const byId = new Map((covers.data ?? []).map((cover) => [cover.id, cover]));
  return stories.map((story) => ({ ...story, cover: story.cover_image_id ? byId.get(story.cover_image_id) ?? null : null }));
}