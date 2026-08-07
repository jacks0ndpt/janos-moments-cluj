import { supabase } from "@/integrations/supabase/client";
import {
  detectOrientationFrom,
  optimizeImage,
  type ImageMeta,
} from "@/lib/imageOptimizer";

export type StoredImageRow = {
  id: string;
  storage_path: string;
  original_filename: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
};

export type OptimizeStoredResult = {
  original: ImageMeta;
  optimized: ImageMeta;
};

/**
 * Re-optimizes an image that is already in Storage.
 * Order: download → optimize → upload new object → verify → update DB → delete old object.
 * Any failure before the DB update leaves the original image fully intact.
 */
export async function optimizeStoredImage(row: StoredImageRow): Promise<OptimizeStoredResult> {
  const dl = await supabase.storage.from("gallery").download(row.storage_path);
  if (dl.error || !dl.data) throw new Error(dl.error?.message ?? "Could not download the stored file");
  const sourceBlob = dl.data;

  const result = await optimizeImage(sourceBlob, row.original_filename ?? row.storage_path);
  const newPath = `${crypto.randomUUID()}.jpg`;

  const up = await supabase.storage
    .from("gallery")
    .upload(newPath, result.blob, { contentType: "image/jpeg", upsert: false });
  if (up.error) throw new Error(`Upload failed: ${up.error.message}`);

  // verify the new object is readable and complete before touching the database
  const verify = await supabase.storage.from("gallery").download(newPath);
  if (verify.error || !verify.data || verify.data.size !== result.blob.size) {
    await supabase.storage.from("gallery").remove([newPath]);
    throw new Error("Verification of the optimized file failed — original kept");
  }

  const { error: updErr } = await supabase
    .from("gallery_images")
    .update({
      storage_path: newPath,
      width: result.optimized.width,
      height: result.optimized.height,
      orientation: detectOrientationFrom(result.optimized.width, result.optimized.height),
      file_size: result.optimized.size,
      mime_type: "image/jpeg",
    })
    .eq("id", row.id);
  if (updErr) {
    // roll the new file back so no orphan is left behind
    await supabase.storage.from("gallery").remove([newPath]);
    throw new Error(`Database update failed: ${updErr.message}`);
  }

  // finally drop the old object (row already points at the new one)
  if (row.storage_path !== newPath) {
    await supabase.storage.from("gallery").remove([row.storage_path]);
  }

  return {
    original: { ...result.original, size: sourceBlob.size },
    optimized: result.optimized,
  };
}
