import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadPublicStories } from "@/lib/publicStories";
import { publicUrl } from "@/lib/portfolioSource";

export default function Stories() {
  const { language } = useLanguage();
  const text = (en: string, ro: string) => language === "ro" ? ro : en;
  const { data: stories = [], isPending, isError } = useQuery({ queryKey: ["public-stories"], queryFn: loadPublicStories });
  const title = text("Wedding Stories", "Povești de nuntă");
  const intro = text("Real days, honest emotions, stories told through photographs.", "Zile autentice, emoții sincere, povești spuse prin fotografii.");

  return <>
    <Helmet>
      <title>{title} | Jimmy Hada</title>
      <meta name="description" content={intro} />
      <link rel="canonical" href="https://jimmyhada.com/stories" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://jimmyhada.com/stories" />
      <meta property="og:title" content={`${title} | Jimmy Hada`} />
      <meta property="og:description" content={intro} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
    <Header />
    <main className="pt-24 min-h-screen">
      <section className="section-padding">
        <div className="container-wide">
          <header className="mb-12 md:mb-16 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-5 tracking-normal">{title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{intro}</p>
          </header>
          {isPending && <p role="status" className="text-muted-foreground">{text("Loading stories…", "Se încarcă poveștile…")}</p>}
          {isError && <p role="alert" className="text-muted-foreground">{text("Stories could not be loaded right now. Please try again shortly.", "Poveștile nu au putut fi încărcate momentan. Te rugăm să încerci din nou în scurt timp.")}</p>}
          {!isPending && !isError && !stories.length && <p className="text-muted-foreground">{text("No published stories yet.", "Nu există povești publicate încă.")}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16">
            {stories.map((story, index) => {
              const name = language === "ro" ? story.title_ro : story.title_en;
              return <Link key={story.id} to={`/stories/${encodeURIComponent(story.slug)}`} className="block min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4">
                <article>
                  <div className="aspect-[4/3] bg-muted overflow-hidden mb-5">
                    {story.cover && <img src={publicUrl(story.cover.storage_path)} alt={(language === "ro" ? story.cover.alt_ro : story.cover.alt_en) || name} loading={index === 0 ? "eager" : "lazy"} decoding="async" className="w-full h-full object-cover" />}
                  </div>
                  <h2 className="text-3xl leading-tight tracking-normal break-words mb-2">{name}</h2>
                  <div className="text-sm text-muted-foreground space-y-1 break-words">
                    {story.venue && <p>{story.venue}</p>}
                    {story.location && <p>{story.location}</p>}
                    {story.event_date && <time dateTime={story.event_date} className="block">{new Date(`${story.event_date}T12:00:00`).toLocaleDateString(language === "ro" ? "ro-RO" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>}
                  </div>
                </article>
              </Link>;
            })}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}