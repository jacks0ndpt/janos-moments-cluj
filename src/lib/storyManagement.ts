import { supabase } from "@/integrations/supabase/client";
import { GALLERY_BUCKET } from "@/lib/gallery";
import { optimizeImage, detectOrientationFrom } from "@/lib/imageOptimizer";
import type { StoryImageRow } from "@/lib/storyEditor";

export async function uploadStoryPhoto(storyId: string, file: File, position: number, userId: string | null) {
  const result = await optimizeImage(file, file.name);
  const path = `${crypto.randomUUID()}.jpg`;
  const upload = await supabase.storage.from(GALLERY_BUCKET).upload(path, result.blob, { contentType: "image/jpeg", upsert: false });
  if (upload.error) throw upload.error;
  const insert = await supabase.from("gallery_images").insert({
    story_id: storyId, storage_path: path, original_filename: file.name,
    width: result.optimized.width, height: result.optimized.height,
    orientation: detectOrientationFrom(result.optimized.width, result.optimized.height),
    file_size: result.optimized.size, mime_type: "image/jpeg", position,
    status: "draft", uploaded_by: userId,
  }).select("*").single();
  if (insert.error) {
    const cleanup = await supabase.storage.from(GALLERY_BUCKET).remove([path]);
    if (cleanup.error) throw new Error(`${insert.error.message}; ${cleanup.error.message}`);
    throw insert.error;
  }
  return insert.data;
}

/** Storage first; DB foreign keys clear cover and homepage references. */
export async function deleteStoryPhoto(image: Pick<StoryImageRow, "id" | "storage_path" | "story_id">) {
  const removed = await supabase.storage.from(GALLERY_BUCKET).remove([image.storage_path]);
  if (removed.error) throw removed.error;
  const result = await supabase.from("gallery_images").delete().eq("id", image.id).eq("story_id", image.story_id).select("id").single();
  if (result.error) throw result.error;
}

export async function deleteStory(storyId: string) {
  const photos = await supabase.from("gallery_images").select("id, storage_path, story_id").eq("story_id", storyId);
  if (photos.error) throw photos.error;
  for (const image of photos.data ?? []) await deleteStoryPhoto(image);
  const result = await supabase.from("gallery_stories").delete().eq("id", storyId).eq("is_system", false).select("id").single();
  if (result.error) throw result.error;
}