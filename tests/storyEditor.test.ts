import { describe, expect, test } from "bun:test";
import { canUseStoryCover, storyEditorialPatch, type StoryRow } from "../src/lib/storyEditor";

describe("existing Story preservation", () => {
  test("covers use an existing image from the same story", () => {
    expect(canUseStoryCover("story-a", { story_id: "story-a" })).toBe(true);
    expect(canUseStoryCover("story-a", { story_id: "story-b" })).toBe(false);
  });
  test("editor saves never replace category, position, system flag or story identity", () => {
    const oldStory: StoryRow = {
      id: "story-a", category_id: "category-a", position: 2000, is_system: true,
      title_en: "Wedding", title_ro: "Nuntă", slug: "old-wedding", status: "published",
      location: null, event_date: null, cover_image_id: "existing-image",
      venue: null, intro_ro: null, intro_en: null, is_featured: false,
      created_at: "2026-01-01", updated_at: "2026-01-01",
    };
    const patch = storyEditorialPatch(oldStory);
    expect(patch.cover_image_id).toBe("existing-image");
    expect(patch.event_date).toBeNull();
    for (const key of ["id", "category_id", "position", "is_system", "is_featured"]) {
      expect(Object.hasOwn(patch, key)).toBe(false);
    }
  });
});