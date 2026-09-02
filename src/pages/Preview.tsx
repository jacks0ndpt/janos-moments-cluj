import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Download,
  Instagram,
  Link2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { zipSync } from "fflate";
import {
  fetchPublishedPreview,
  formatWeddingDate,
  previewImageUrl,
  previewPublicUrl,
  slugifyNames,
  type PreviewImageRow,
  type PreviewRow,
} from "@/lib/samedayPreview";


type Group =
  | { kind: "single"; images: [PreviewImageRow] }
  | { kind: "pair"; images: [PreviewImageRow, PreviewImageRow] };

/** Editorial rhythm: two consecutive portraits pair up, everything else breathes full width. */
function groupImages(images: PreviewImageRow[]): Group[] {
  const isPortrait = (i: PreviewImageRow) =>
    i.orientation === "portrait" || (!!i.width && !!i.height && i.height > i.width);
  const groups: Group[] = [];
  let i = 0;
  while (i < images.length) {
    const a = images[i];
    const b = images[i + 1];
    if (b && isPortrait(a) && isPortrait(b)) {
      groups.push({ kind: "pair", images: [a, b] });
      i += 2;
    } else {
      groups.push({ kind: "single", images: [a] });
      i += 1;
    }
  }
  return groups;
}

export default function Preview() {
  const { slug = "" } = useParams();
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "missing" }
    | { status: "error" }
    | { status: "ready"; preview: PreviewRow; images: PreviewImageRow[] }
  >({ status: "loading" });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [Lightbox, setLightboxComponent] = useState<
    null | typeof import("@/components/preview/PreviewLightbox").default
  >(null);
  const [zipping, setZipping] = useState(false);
  const [zipDone, setZipDone] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    fetchPublishedPreview(slug)
      .then((res) => {
        if (!active) return;
        if (!res) setState({ status: "missing" });
        else setState({ status: "ready", preview: res.preview, images: res.images });
      })
      .catch((err) => {
        console.error("Same Day Preview failed to load", err);
        if (active) setState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (lightbox === null || Lightbox) return;
    let active = true;
    import("@/components/preview/PreviewLightbox")
      .then((m) => {
        // Wrap in a factory: passing a component to setState would be treated
        // as a state updater and invoked with the previous state.
        if (active) setLightboxComponent(() => m.default);
      })
      .catch((err) => console.error("Lightbox failed to load", err));
    return () => {
      active = false;
    };
  }, [lightbox, Lightbox]);


  const ready = state.status === "ready" ? state : null;
  const images = ready?.images ?? [];
  const cover = useMemo(() => {
    if (!ready) return null;
    return (
      images.find((i) => i.id === ready.preview.cover_image_id) ?? images[0] ?? null
    );
  }, [ready, images]);
  const galleryImages = useMemo(
    () => (cover ? images.filter((i) => i.id !== cover.id) : images),
    [images, cover],
  );
  const groups = useMemo(() => groupImages(galleryImages), [galleryImages]);
  const shareUrl = previewPublicUrl(slug);

  async function share() {
    const title = ready ? `${ready.preview.couple_names} — Same Day Preview` : "Same Day Preview";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  }

  const openAt = (image: PreviewImageRow) => {
    const i = images.findIndex((x) => x.id === image.id);
    if (i >= 0) setLightbox(i);
  };

  async function downloadAll() {
    if (!ready || zipping || images.length === 0) return;
    const base = slugifyNames(ready.preview.couple_names) || "same-day";
    setZipping(true);
    setZipDone(0);
    const files: Record<string, Uint8Array> = {};
    let failed = 0;
    try {
      for (let i = 0; i < images.length; i++) {
        try {
          const res = await fetch(previewImageUrl(images[i].storage_path));
          if (!res.ok) throw new Error(String(res.status));
          const buf = new Uint8Array(await res.arrayBuffer());
          files[`${base}-${String(i + 1).padStart(2, "0")}.jpg`] = buf;
        } catch {
          failed += 1;
        }
        setZipDone(i + 1);
      }
      const names = Object.keys(files);
      if (names.length === 0) {
        toast.error("Could not prepare the download");
        return;
      }
      const zipped = zipSync(files, { level: 0 });
      const blob = new Blob([zipped as unknown as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}-same-day-preview.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      if (failed > 0) toast.warning(`${failed} photo(s) could not be included`);
    } catch (err) {
      console.error("Download all failed", err);
      toast.error("Could not prepare the download");
    } finally {
      setZipping(false);
      setZipDone(0);
    }
  }




  return (
    <div className="preview-theme min-h-screen bg-background text-foreground font-body antialiased">
      <Helmet>
        <title>
          {ready ? `${ready.preview.couple_names} — Same Day Preview` : "Same Day Preview"}
        </title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>

      {/* Restrained branding */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="font-heading text-lg tracking-wide text-foreground drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
          Jimmy Hada
        </span>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Back to website
        </a>

      </header>

      {state.status === "loading" && (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Loading…</p>
        </div>
      )}

      {(state.status === "missing" || state.status === "error") && (
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">
            Jimmy Hada Photography
          </p>
          <h1 className="mt-6 font-heading text-3xl sm:text-4xl">
            {state.status === "missing" ? "This preview is not available" : "Something went wrong"}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {state.status === "missing"
              ? "The link may have changed or the preview is no longer published. Please check with us and we will send it again."
              : "We could not load this preview right now. Please try again in a moment."}
          </p>
          <Link
            to="/"
            className="mt-8 text-xs uppercase tracking-[0.2em] text-primary hover:opacity-80"
          >
            Go to jimmyhada.com
          </Link>
        </main>
      )}

      {ready && (
        <main className="relative">
          {/* Hero */}
          <section className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden">
            {cover && (
              <img
                src={previewImageUrl(cover.storage_path)}
                alt={`${ready.preview.couple_names} — cover photograph`}
                width={cover.width ?? undefined}
                height={cover.height ?? undefined}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/85"
            />
            <div className="relative z-10 w-full px-6 pb-20 text-center sm:pb-24">
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary sm:text-[11px]">
                Same Day Preview
              </p>
              <h1 className="mt-5 font-heading text-4xl font-light leading-tight sm:text-6xl lg:text-7xl">
                {ready.preview.couple_names}
              </h1>
              <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-foreground/80">
                {formatWeddingDate(ready.preview.wedding_date)}
              </p>
              {ready.preview.message && (
                <p className="mx-auto mt-7 max-w-md font-heading text-lg italic text-foreground/85 sm:text-xl">
                  {ready.preview.message}
                </p>
              )}
            </div>
            <ChevronDown
              aria-hidden="true"
              className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-foreground/60"
              size={22}
            />
          </section>

          {/* Gallery */}
          <section
            aria-label="Photographs"
            className="mx-auto max-w-6xl px-3 py-12 sm:px-6 sm:py-20"
          >
            <div className="space-y-4 sm:space-y-8">
              {groups.map((group, gi) =>
                group.kind === "pair" ? (
                  <div key={gi} className="grid grid-cols-2 gap-3 sm:gap-6">
                    {group.images.map((img) => (
                      <PreviewPhoto
                        key={img.id}
                        image={img}
                        coupleNames={ready.preview.couple_names}
                        onOpen={openAt}
                        sizes="(max-width: 640px) 50vw, 45vw"
                      />
                    ))}
                  </div>
                ) : (
                  <PreviewPhoto
                    key={group.images[0].id}
                    image={group.images[0]}
                    coupleNames={ready.preview.couple_names}
                    onOpen={openAt}
                    sizes="(max-width: 640px) 100vw, 90vw"
                  />
                ),
              )}
            </div>

            {galleryImages.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                More photographs are on their way.
              </p>
            )}
          </section>

          {/* Share */}
          <section className="border-t border-border px-6 py-14 text-center">
            <h2 className="font-heading text-2xl">Share this preview</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Share2 size={15} aria-hidden="true" /> Share
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Link2 size={15} aria-hidden="true" /> Copy link
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                WhatsApp
              </a>
              <button
                type="button"
                onClick={downloadAll}
                disabled={zipping || images.length === 0}
                aria-label="Download all photos as a ZIP archive"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={15} aria-hidden="true" />
                {zipping ? `Preparing ${zipDone} of ${images.length}…` : "Download all"}
              </button>
            </div>
          </section>

          {/* Brand connection */}
          <footer className="border-t border-border px-6 py-16 text-center">
            <p className="font-heading text-2xl sm:text-3xl">Like the way this story feels?</p>
            <a
              href="/portfolio/weddings"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary transition-opacity hover:opacity-80"
            >
              Explore more weddings <ArrowRight size={14} aria-hidden="true" />
            </a>

            <div className="mt-12 flex flex-col items-center gap-3 text-muted-foreground">
              <span className="font-heading text-base tracking-wide">Jimmy Hada Photography</span>
              <a
                href="https://instagram.com/jimmyhada.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs tracking-wide transition-colors hover:text-primary"
              >
                <Instagram size={14} aria-hidden="true" /> @jimmyhada.studio
              </a>
            </div>
          </footer>
        </main>
      )}

      {ready && Lightbox && lightbox !== null && images[lightbox] && (
        <Lightbox
          images={images}
          index={lightbox}
          coupleNames={ready.preview.couple_names}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      )}
    </div>
  );
}

function PreviewPhoto({
  image,
  coupleNames,
  onOpen,
  sizes,
}: {
  image: PreviewImageRow;
  coupleNames: string;
  onOpen: (image: PreviewImageRow) => void;
  sizes: string;
}) {
  const ratio =
    image.width && image.height ? `${image.width} / ${image.height}` : "3 / 2";
  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      aria-label={`Open photograph of ${coupleNames} fullscreen`}
      className="group block w-full overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      style={{ aspectRatio: ratio }}
    >
      <img
        src={previewImageUrl(image.storage_path)}
        alt={`${coupleNames} — wedding photograph`}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />
    </button>
  );
}