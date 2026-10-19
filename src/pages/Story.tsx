import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadPublicStory, type PublicStoryImage } from "@/lib/publicStories";
import { publicUrl } from "@/lib/portfolioSource";
import PreviewLightbox from "@/components/preview/PreviewLightbox";
import type { PreviewImageRow } from "@/lib/samedayPreview";

function isPortrait(image: PublicStoryImage) {
  return !!(image.width && image.height && image.height > image.width);
}

/** Editorial rhythm: consecutive landscape photos pair up; portraits stay large and centered. */
function rhythm(images: PublicStoryImage[]): PublicStoryImage[][] {
  const rows: PublicStoryImage[][] = [];
  let i = 0;
  while (i < images.length) {
    const current = images[i];
    const next = images[i + 1];
    if (!isPortrait(current) && next && !isPortrait(next)) {
      rows.push([current, next]);
      i += 2;
    } else {
      rows.push([current]);
      i += 1;
    }
  }
  return rows;
}

export default function Story() {
  const { slug = "" } = useParams();
  const { language } = useLanguage();
  const text = (en: string, ro: string) => (language === "ro" ? ro : en);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const { data: story, isPending, isError } = useQuery({
    queryKey: ["public-story", slug],
    queryFn: () => loadPublicStory(slug),
  });

  const title = story ? (language === "ro" ? story.title_ro : story.title_en) : "";
  const intro = story ? (language === "ro" ? story.intro_ro : story.intro_en) : null;
  const canonical = `https://jimmyhada.com/stories/${slug}`;
  const meta = [story?.venue, story?.location].filter(Boolean).join(" · ");

  const lightboxImages = (story?.images ?? []) as unknown as PreviewImageRow[];

  return (
    <>
      <Helmet>
        <title>{story ? `${title} | Jimmy Hada` : text("Story not found", "Povestea nu a fost găsită") + " | Jimmy Hada"}</title>
        {story && <meta name="description" content={intro || meta || title} />}
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={story ? `${title} | Jimmy Hada` : "Jimmy Hada"} />
        {story && <meta property="og:description" content={intro || meta || title} />}
        {story?.cover && <meta property="og:image" content={publicUrl(story.cover.storage_path)} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Header />
      <main className="pt-24 min-h-screen">
        {isPending && (
          <p role="status" className="section-padding container-wide text-muted-foreground">
            {text("Loading story…", "Se încarcă povestea…")}
          </p>
        )}
        {isError && (
          <p role="alert" className="section-padding container-wide text-muted-foreground">
            {text("This story could not be loaded right now. Please try again shortly.", "Povestea nu a putut fi încărcată momentan. Te rugăm să încerci din nou în scurt timp.")}
          </p>
        )}
        {!isPending && !isError && !story && (
          <section className="section-padding container-wide text-center">
            <h1 className="text-4xl md:text-5xl mb-5">{text("Story not found", "Povestea nu a fost găsită")}</h1>
            <p className="text-muted-foreground mb-8">
              {text("This story is not available. It may have been moved or unpublished.", "Această poveste nu este disponibilă. Poate a fost mutată sau retrasă.")}
            </p>
            <Link to="/stories" className="underline underline-offset-4">
              {text("Explore more stories", "Descoperă mai multe povești")}
            </Link>
          </section>
        )}
        {story && (
          <>
            {/* Hero */}
            <section className="container-wide">
              <div className="relative overflow-hidden bg-muted">
                {story.cover && (
                  <img
                    src={publicUrl(story.cover.storage_path)}
                    alt={(language === "ro" ? story.cover.alt_ro : story.cover.alt_en) || title}
                    className="w-full max-h-[80vh] object-cover"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-background">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-3">{title}</h1>
                  <div className="text-sm md:text-base text-background/85 space-y-1">
                    {story.venue && <p>{story.venue}</p>}
                    {story.location && <p>{story.location}</p>}
                    {story.event_date && (
                      <time dateTime={story.event_date} className="block">
                        {new Date(`${story.event_date}T12:00:00`).toLocaleDateString(language === "ro" ? "ro-RO" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </time>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Intro */}
            {intro && (
              <section className="section-padding container-wide">
                <p className="max-w-2xl text-lg leading-relaxed text-left">{intro}</p>
              </section>
            )}

            {/* Gallery */}
            <section className="container-wide pb-16 md:pb-24 space-y-4 md:space-y-6">
              {rhythm(story.images).map((row, rowIndex) =>
                row.length === 2 ? (
                  <div key={rowIndex} className="grid grid-cols-2 gap-4 md:gap-6">
                    {row.map((image) => {
                      const index = story.images.indexOf(image);
                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setLightbox(index)}
                          className="block w-full overflow-hidden bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                          aria-label={text(`Open photo ${index + 1}`, `Deschide fotografia ${index + 1}`)}
                        >
                          <img
                            src={publicUrl(image.storage_path)}
                            alt={(language === "ro" ? image.alt_ro : image.alt_en) || `${title} — ${index + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  (() => {
                    const image = row[0];
                    const index = story.images.indexOf(image);
                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setLightbox(index)}
                        className={`block w-full overflow-hidden bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${isPortrait(image) ? "max-w-2xl mx-auto" : ""}`}
                        aria-label={text(`Open photo ${index + 1}`, `Deschide fotografia ${index + 1}`)}
                      >
                        <img
                          src={publicUrl(image.storage_path)}
                          alt={(language === "ro" ? image.alt_ro : image.alt_en) || `${title} — ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto"
                        />
                      </button>
                    );
                  })()
                )
              )}
            </section>

            {/* Ending CTA */}
            <section className="section-padding container-wide text-center border-t border-border">
              <h2 className="text-3xl md:text-4xl mb-6">{text("Planning something similar?", "Plănuiești ceva similar?")}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {text("Check availability", "Verifică disponibilitatea")}
                </Link>
                <Link to="/stories" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
                  {text("Explore more stories", "Descoperă mai multe povești")}
                </Link>
              </div>
            </section>

            {lightbox !== null && lightboxImages[lightbox] && (
              <PreviewLightbox
                images={lightboxImages}
                index={lightbox}
                coupleNames={title}
                shareUrl={canonical}
                onClose={() => setLightbox(null)}
                onIndexChange={setLightbox}
              />
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
