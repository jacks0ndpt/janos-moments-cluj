import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { previewImageUrl, type PreviewImageRow } from "@/lib/samedayPreview";

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
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showHint, setShowHint] = useState(() => !hintShown && images.length > 1);
  const image = images[index];

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${coupleNames} — photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-[hsl(28_8%_3%)] animate-[fadeIn_0.2s_ease-out]"
      onClick={closeIfBackdrop}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        touchStart.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) next();
          else prev();
        }
      }}
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
          key={image.id}
          src={previewImageUrl(image.storage_path)}
          alt={`${coupleNames} — photo ${index + 1}`}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          className="max-h-full max-w-full object-contain animate-[fadeIn_0.25s_ease-out]"
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
