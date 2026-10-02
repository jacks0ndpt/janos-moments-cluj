import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { previewImageUrl, type PreviewImageRow } from "@/lib/samedayPreview";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2;

type Point = { x: number; y: number };
type Transform = Point & { scale: number };

const initialTransform: Transform = { scale: MIN_ZOOM, x: 0, y: 0 };

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

type Props = {
  images: PreviewImageRow[];
  index: number;
  coupleNames: string;
  shareUrl?: string;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

// Swipe hint is shown only on the first open during a page visit.
let hintShown = false;

const ctrl =
  "flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-white/10 px-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60";

export default function PreviewLightbox(props: Props) {
  const {
    images = [],
    index = 0,
    coupleNames = "",
    shareUrl = typeof window !== "undefined" ? window.location.href : "",
    onClose = () => undefined,
    onIndexChange = () => undefined,
  } = props ?? ({} as Props);
  const closeRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gestureStart = useRef<{
    distance: number;
    midpoint: Point;
    transform: Transform;
  } | null>(null);
  const dragStart = useRef<{ point: Point; transform: Transform } | null>(null);
  const swipeStart = useRef<Point | null>(null);
  const hadPinch = useRef(false);
  const moved = useRef(false);
  const lastTap = useRef<{ time: number; point: Point } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showHint, setShowHint] = useState(() => !hintShown && images.length > 1);
  const [transform, setTransform] = useState<Transform>(initialTransform);
  const transformRef = useRef<Transform>(initialTransform);
  const image = images[index];

  const updateTransform = useCallback((next: Transform) => {
    const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.scale));
    if (scale <= MIN_ZOOM + 0.01) {
      transformRef.current = initialTransform;
      setTransform(initialTransform);
      return;
    }

    const imageElement = imageRef.current;
    const maxX = imageElement ? (imageElement.offsetWidth * (scale - 1)) / 2 : 0;
    const maxY = imageElement ? (imageElement.offsetHeight * (scale - 1)) / 2 : 0;
    const bounded = {
      scale,
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
    transformRef.current = bounded;
    setTransform(bounded);
  }, []);

  const resetZoom = useCallback(() => {
    pointers.current.clear();
    gestureStart.current = null;
    dragStart.current = null;
    swipeStart.current = null;
    hadPinch.current = false;
    moved.current = false;
    lastTap.current = null;
    transformRef.current = initialTransform;
    setTransform(initialTransform);
  }, []);

  const next = useCallback(
    () => images.length && onIndexChange((index + 1) % images.length),
    [index, images.length, onIndexChange],
  );
  const prev = useCallback(
    () => images.length && onIndexChange((index - 1 + images.length) % images.length),
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!showHint) return;
    hintShown = true;
    const t = setTimeout(() => setShowHint(false), 1800);
    return () => clearTimeout(t);
  }, [showHint]);

  useEffect(() => {
    resetZoom();
  }, [image?.id, resetZoom]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose]);

  const fileName = () =>
    `${coupleNames.replace(/[^\w]+/g, "-").toLowerCase()}-${index + 1}.jpg`;

  async function download() {
    if (!image || downloading) return;
    setDownloading(true);
    const url = previewImageUrl(image.storage_path);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName();
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    } catch {
      window.open(url, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  }

  async function share() {
    if (!image || sharing) return;
    setSharing(true);
    const title = `${coupleNames} — Jimmy Hada Photography`;
    try {
      if (navigator.share) {
        // Try sharing the actual photo file first.
        try {
          if (navigator.canShare) {
            const res = await fetch(previewImageUrl(image.storage_path));
            const blob = await res.blob();
            const file = new File([blob], fileName(), { type: blob.type || "image/jpeg" });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title });
              return;
            }
          }
        } catch (err) {
          if ((err as DOMException)?.name === "AbortError") return;
        }
        try {
          await navigator.share({ title, url: shareUrl });
          return;
        } catch (err) {
          if ((err as DOMException)?.name === "AbortError") return;
        }
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not share this photo");
    } finally {
      setSharing(false);
    }
  }

  if (!image) return null;

  const closeIfBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onImagePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (e.pointerType !== "touch") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, point);

    if (pointers.current.size === 1) {
      dragStart.current = { point, transform: transformRef.current };
      swipeStart.current = point;
      moved.current = false;
      hadPinch.current = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      gestureStart.current = {
        distance: Math.max(1, distance(a, b)),
        midpoint: midpoint(a, b),
        transform: transformRef.current,
      };
      hadPinch.current = true;
      moved.current = true;
    }
  };

  const onImagePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (e.pointerType !== "touch" || !pointers.current.has(e.pointerId)) return;
    const point = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, point);

    if (pointers.current.size === 2 && gestureStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const start = gestureStart.current;
      const currentMidpoint = midpoint(a, b);
      const scale = start.transform.scale * (distance(a, b) / start.distance);
      updateTransform({
        scale,
        x: start.transform.x + currentMidpoint.x - start.midpoint.x,
        y: start.transform.y + currentMidpoint.y - start.midpoint.y,
      });
      return;
    }

    const start = dragStart.current;
    if (!start) return;
    const dx = point.x - start.point.x;
    const dy = point.y - start.point.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved.current = true;
    if (transformRef.current.scale > MIN_ZOOM) {
      updateTransform({
        scale: start.transform.scale,
        x: start.transform.x + dx,
        y: start.transform.y + dy,
      });
    }
  };

  const onImagePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    if (e.pointerType !== "touch") return;
    const point = pointers.current.get(e.pointerId) ?? { x: e.clientX, y: e.clientY };
    const wasPinch = hadPinch.current;
    pointers.current.delete(e.pointerId);

    if (pointers.current.size === 1) {
      const remaining = Array.from(pointers.current.values())[0];
      dragStart.current = { point: remaining, transform: transformRef.current };
      gestureStart.current = null;
      return;
    }

    if (pointers.current.size > 0) return;
    gestureStart.current = null;

    if (transformRef.current.scale <= MIN_ZOOM + 0.01) {
      updateTransform(initialTransform);
      const start = swipeStart.current;
      if (!wasPinch && start) {
        const dx = point.x - start.x;
        const dy = point.y - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          lastTap.current = null;
          if (dx < 0) next();
          else prev();
        } else if (!moved.current) {
          const now = Date.now();
          const previousTap = lastTap.current;
          if (
            previousTap &&
            now - previousTap.time < 320 &&
            distance(previousTap.point, point) < 30
          ) {
            updateTransform({ scale: DOUBLE_TAP_ZOOM, x: 0, y: 0 });
            lastTap.current = null;
          } else {
            lastTap.current = { time: now, point };
          }
        }
      }
    } else if (!wasPinch && !moved.current) {
      const now = Date.now();
      const previousTap = lastTap.current;
      if (
        previousTap &&
        now - previousTap.time < 320 &&
        distance(previousTap.point, point) < 30
      ) {
        updateTransform(initialTransform);
        lastTap.current = null;
      } else {
        lastTap.current = { time: now, point };
      }
    }

    dragStart.current = null;
    swipeStart.current = null;
    hadPinch.current = false;
    moved.current = false;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${coupleNames} — photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-[hsl(28_8%_3%)] animate-[fadeIn_0.2s_ease-out]"
      onClick={closeIfBackdrop}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-3 sm:px-6"
        onClick={closeIfBackdrop}
      >
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs tracking-[0.18em] text-white">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={share} aria-label="Share this photo" className={ctrl} disabled={sharing}>
            <Share2 size={18} aria-hidden="true" />
            <span className="hidden text-xs tracking-wide sm:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={download}
            aria-label="Download this photo"
            className={ctrl}
            disabled={downloading}
          >
            <Download size={18} aria-hidden="true" />
            <span className="hidden text-xs tracking-wide sm:inline">
              {downloading ? "Preparing…" : "Download"}
            </span>
          </button>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={ctrl}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-6 sm:px-20"
        onClick={closeIfBackdrop}
      >
        <img
          ref={imageRef}
          key={image.id}
          src={previewImageUrl(image.storage_path)}
          alt={`${coupleNames} — photo ${index + 1}`}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          draggable={false}
          className="max-h-full max-w-full touch-none select-none object-contain animate-[fadeIn_0.25s_ease-out]"
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: "center",
            willChange: transform.scale > MIN_ZOOM ? "transform" : "auto",
          }}
          onPointerDown={onImagePointerDown}
          onPointerMove={onImagePointerMove}
          onPointerUp={onImagePointerUp}
          onPointerCancel={onImagePointerUp}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/90 transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-4"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/90 transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-4"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </>
        )}
        {images.length > 1 && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs tracking-[0.2em] text-white transition-opacity duration-500 ${
              showHint ? "opacity-100" : "opacity-0"
            }`}
          >
            ‹ Swipe ›
          </div>
        )}
      </div>
    </div>
  );
}
