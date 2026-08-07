import encode from "@jsquash/jpeg/encode";

/** Optimization contract for every image stored in the gallery bucket. */
export const MAX_LONG_EDGE = 2000;
export const JPEG_QUALITY = 82;
export const MAX_FILE_SIZE = Math.round(1.2 * 1024 * 1024); // 1.2 MB

export type ImageMeta = { width: number; height: number; size: number };
export type OptimizeResult = {
  blob: Blob;
  original: ImageMeta;
  optimized: ImageMeta;
  /** true when the source already met the contract and was re-encoded anyway */
  resized: boolean;
};

export class UnsupportedImageError extends Error {}

function isProbablySupported(type: string, name?: string): boolean {
  const t = (type || "").toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg" || t === "image/png" || t === "image/webp") return true;
  if (t.startsWith("image/")) return true; // let the decoder decide
  const ext = (name ?? "").toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  return !!ext && ["jpg", "jpeg", "png", "webp"].includes(ext);
}

/** Decode a blob into a bitmap with EXIF orientation already applied. */
async function decodeOriented(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob, { imageOrientation: "from-image" });
    } catch {
      /* fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new UnsupportedImageError("Image could not be decoded"));
      img.src = url;
    });
    if (typeof img.decode === "function") await img.decode().catch(() => undefined);
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function sizeOf(src: ImageBitmap | HTMLImageElement) {
  return src instanceof HTMLImageElement
    ? { width: src.naturalWidth, height: src.naturalHeight }
    : { width: src.width, height: src.height };
}

function makeCanvas(w: number, h: number) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Resize (never upscale) to a 2000 px long edge, bake in orientation, drop all
 * metadata (canvas keeps pixels only) and re-encode as progressive sRGB JPEG q82.
 */
export async function optimizeImage(
  input: Blob,
  filename?: string,
): Promise<OptimizeResult> {
  if (!isProbablySupported(input.type, filename)) {
    throw new UnsupportedImageError(
      "Unsupported file type. JPEG and PNG are supported — convert HEIC/RAW files first.",
    );
  }

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decodeOriented(input);
  } catch (err) {
    throw new UnsupportedImageError(
      "Could not read this image (corrupted or unsupported format such as HEIC/RAW).",
    );
  }

  const { width: srcW, height: srcH } = sizeOf(source);
  if (!srcW || !srcH) throw new UnsupportedImageError("Image has no readable dimensions.");

  const scale = Math.min(1, MAX_LONG_EDGE / Math.max(srcW, srcH)); // never upscale
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = makeCanvas(width, height);
  const ctx = (canvas as HTMLCanvasElement).getContext("2d", {
    colorSpace: "srgb",
  } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // flatten transparency (PNG) onto white so JPEG output stays clean
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  if (!(source instanceof HTMLImageElement)) source.close?.();

  const imageData = ctx.getImageData(0, 0, width, height);
  const buffer = await encode(imageData, {
    quality: JPEG_QUALITY,
    baseline: false,
    progressive: true,
    optimize_coding: true,
    arithmetic: false,
  });
  const blob = new Blob([buffer], { type: "image/jpeg" });

  return {
    blob,
    original: { width: srcW, height: srcH, size: input.size },
    optimized: { width, height, size: blob.size },
    resized: scale < 1,
  };
}

/* ------------------------------ helpers ------------------------------ */

export function formatBytes(bytes?: number | null): string {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDimensions(w?: number | null, h?: number | null): string {
  return w && h ? `${w} × ${h} px` : "— px";
}

export function savedPercent(before: number, after: number): number {
  if (!before) return 0;
  return Math.max(0, Math.round(((before - after) / before) * 100));
}

/** An image needs optimization when its long edge or file size exceeds the contract. */
export function needsOptimization(img: {
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
}): boolean {
  const longEdge = Math.max(img.width ?? 0, img.height ?? 0);
  if (longEdge > MAX_LONG_EDGE) return true;
  if ((img.file_size ?? 0) > MAX_FILE_SIZE) return true;
  return false;
}

export function detectOrientationFrom(w: number, h: number): "landscape" | "portrait" | "square" {
  if (w === h) return "square";
  return w > h ? "landscape" : "portrait";
}
