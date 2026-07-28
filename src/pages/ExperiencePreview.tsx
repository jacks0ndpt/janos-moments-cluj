import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadAllImages, loadFeaturedImages, type PortfolioImage } from '@/lib/portfolioSource';

type Lang = 'en' | 'ro';

const copy: Record<Lang, {
  meta: { title: string; description: string };
  hero: { label: string; heading: string; body: string };
  intro: string[];
  blocksHeading: string;
  blocks: { h: string; b: string }[];
  practical: { heading: string; items: string[] };
  boundaries: { heading: string; body: string };
  closing: { lines: string[]; cta: string };
  alts: string[];
}> = {
  en: {
    meta: {
      title: 'More Than Wedding Photography | Jimmy Hada',
      description:
        'Discover how experience, calm guidance and thoughtful preparation can shape both your wedding photographs and the way your wedding day feels.',
    },
    hero: {
      label: 'BEYOND THE PHOTOGRAPHS',
      heading: 'Your wedding should feel like a wedding, not a photoshoot.',
      body: 'The photographs are the final result. But the experience, judgement and decisions behind them can shape how naturally the entire day unfolds.',
    },
    intro: [
      'For much of the day, your photographer will be only a few steps away.',
      'Present during the nerves before the ceremony, the embraces afterwards, the family photographs, the unexpected delays, the quiet pauses and the energy of the dance floor.',
      'That closeness comes with responsibility.',
      'An experienced photographer does more than document a finished plan. He works within it, adapting to changing light, delayed schedules, family dynamics, weather and the natural unpredictability of a wedding.',
    ],
    blocksHeading: 'What experience changes',
    blocks: [
      {
        h: 'Before the wedding',
        b: 'Experience begins before the camera is lifted. A thoughtful review of the timeline, locations, travel time and available light can prevent unnecessary pressure later and help photography fit naturally around the wedding.',
      },
      {
        h: 'During the wedding',
        b: 'Some moments benefit from clear guidance. Others need silence and space. Experience means recognising the difference, helping when necessary and disappearing into the background when the moment already speaks for itself.',
      },
      {
        h: 'When plans change',
        b: 'Weddings rarely follow every minute of the schedule. Weather changes, ceremonies run late and people are not always where they are expected to be. Experience allows those situations to be handled calmly, without transferring the pressure to the couple.',
      },
      {
        h: 'So you can remain present',
        b: 'You should not spend your wedding wondering where to stand, what happens next or whether an important moment is being missed. The photographer\u2019s role is to notice, anticipate and preserve the story while giving you space to live it.',
      },
    ],
    practical: {
      heading: 'Experience can help you',
      items: [
        'build a more realistic timeline',
        'avoid unnecessary rushing',
        'feel more comfortable in front of the camera',
        'organise family photographs efficiently',
        'preserve more time with your guests',
        'adapt calmly when plans change',
        'trust that important moments are being noticed',
      ],
    },
    boundaries: {
      heading: 'Guidance without taking over',
      body: 'The goal is not to control your wedding or turn it into a production. It is to offer experience, clarity and calm when they are useful, while allowing the day to remain yours.',
    },
    closing: {
      lines: [
        'You remain present with the people you love.',
        'I notice, anticipate and preserve the story around you.',
        'The photographs are the result, but the way we reach them matters too.',
      ],
      cta: 'Tell me about your wedding',
    },
    alts: [
      'Documentary wedding moment captured in Cluj-Napoca',
      'Quiet preparation moment before the ceremony',
      'Unposed family gathering during a wedding day',
      'Candid emotional moment between the couple',
      'Observed moment on the wedding dance floor',
      'Wedding day light and atmosphere',
    ],
  },
  ro: {
    meta: {
      title: 'Mai mult dec\u00e2t fotografie de nunt\u0103 | Jimmy Hada',
      description:
        'Descoperi\u021bi cum experien\u021ba, \u00eendrumarea calm\u0103 \u0219i preg\u0103tirea atent\u0103 pot influen\u021ba at\u00e2t fotografiile, c\u00e2t \u0219i felul \u00een care se simte ziua nun\u021bii.',
    },
    hero: {
      label: 'DINCOLO DE FOTOGRAFII',
      heading: 'Nunta voastr\u0103 ar trebui s\u0103 se simt\u0103 ca o nunt\u0103, nu ca o \u0219edin\u021b\u0103 foto.',
      body: 'Fotografiile sunt rezultatul final. \u00cens\u0103 experien\u021ba, deciziile \u0219i aten\u021bia din spatele lor pot influen\u021ba felul \u00een care \u00eentreaga zi se desf\u0103\u0219oar\u0103 firesc.',
    },
    intro: [
      'Pe parcursul unei mari p\u0103r\u021bi din zi, fotograful vostru va fi la doar c\u00e2\u021biva pa\u0219i distan\u021b\u0103.',
      'Va fi prezent \u00een emo\u021biile dinaintea ceremoniei, \u00een \u00eembr\u0103\u021bi\u0219\u0103rile de dup\u0103, \u00een timpul fotografiilor de familie, al \u00eent\u00e2rzierilor nea\u0219teptate, al momentelor lini\u0219tite \u0219i al energiei de pe ringul de dans.',
      'Aceast\u0103 apropiere vine cu responsabilitate.',
      'Un fotograf cu experien\u021b\u0103 nu doar documenteaz\u0103 un plan deja f\u0103cut. El lucreaz\u0103 \u00een interiorul lui, adapt\u00e2ndu-se luminii, \u00eent\u00e2rzierilor, dinamicii familiei, vremii \u0219i imprevizibilului firesc al unei nun\u021bi.',
    ],
    blocksHeading: 'Ce schimb\u0103 experien\u021ba',
    blocks: [
      {
        h: '\u00cenainte de nunt\u0103',
        b: 'Experien\u021ba \u00eencepe \u00eenainte ca aparatul foto s\u0103 fie ridicat. O analiz\u0103 atent\u0103 a programului, loca\u021biilor, timpilor de deplasare \u0219i luminii disponibile poate evita presiunea inutil\u0103 \u0219i poate integra fotografia firesc \u00een ziua nun\u021bii.',
      },
      {
        h: '\u00cen timpul nun\u021bii',
        b: 'Unele momente au nevoie de \u00eendrumare clar\u0103. Altele au nevoie de lini\u0219te \u0219i spa\u021biu. Experien\u021ba \u00eenseamn\u0103 s\u0103 recuno\u0219ti diferen\u021ba, s\u0103 aju\u021bi atunci c\u00e2nd este nevoie \u0219i s\u0103 te retragi atunci c\u00e2nd momentul vorbe\u0219te deja de la sine.',
      },
      {
        h: 'C\u00e2nd planurile se schimb\u0103',
        b: 'Nun\u021bile respect\u0103 rar fiecare minut al programului. Vremea se schimb\u0103, ceremoniile \u00eent\u00e2rzie, iar oamenii nu sunt \u00eentotdeauna acolo unde ar trebui s\u0103 fie. Experien\u021ba permite gestionarea calm\u0103 a acestor situa\u021bii, f\u0103r\u0103 ca presiunea s\u0103 ajung\u0103 la miri.',
      },
      {
        h: 'Ca voi s\u0103 pute\u021bi r\u0103m\u00e2ne prezen\u021bi',
        b: 'Nu ar trebui s\u0103 v\u0103 petrece\u021bi nunta \u00eentreb\u00e2ndu-v\u0103 unde s\u0103 sta\u021bi, ce urmeaz\u0103 sau dac\u0103 un moment important este ratat. Rolul fotografului este s\u0103 observe, s\u0103 anticipeze \u0219i s\u0103 p\u0103streze povestea, oferindu-v\u0103 \u00een acela\u0219i timp spa\u021biul de a o tr\u0103i.',
      },
    ],
    practical: {
      heading: 'Experien\u021ba v\u0103 poate ajuta s\u0103',
      items: [
        'construi\u021bi un program mai realist',
        'evita\u021bi graba inutil\u0103',
        'v\u0103 sim\u021bi\u021bi mai confortabil \u00een fa\u021ba camerei',
        'organiza\u021bi eficient fotografiile de familie',
        'p\u0103stra\u021bi mai mult timp pentru invita\u021bi',
        'v\u0103 adapta\u021bi calm atunci c\u00e2nd planurile se schimb\u0103',
        'ave\u021bi \u00eencredere c\u0103 momentele importante sunt observate',
      ],
    },
    boundaries: {
      heading: '\u00cendrumare, f\u0103r\u0103 a prelua controlul',
      body: 'Scopul nu este de a controla nunta sau de a o transforma \u00eentr-o produc\u021bie. Scopul este de a oferi experien\u021b\u0103, claritate \u0219i calm atunci c\u00e2nd sunt utile, l\u0103s\u00e2nd ziua s\u0103 r\u0103m\u00e2n\u0103 a voastr\u0103.',
    },
    closing: {
      lines: [
        'Voi r\u0103m\u00e2ne\u021bi prezen\u021bi al\u0103turi de oamenii pe care \u00eei iubi\u021bi.',
        'Eu observ, anticipez \u0219i p\u0103strez povestea din jurul vostru.',
        'Fotografiile sunt rezultatul, dar \u0219i felul \u00een care ajungem la ele conteaz\u0103.',
      ],
      cta: 'Povesti\u021bi-mi despre nunta voastr\u0103',
    },
    alts: [
      'Moment documentar de nunt\u0103 \u00een Cluj-Napoca',
      'Moment lini\u0219tit de preg\u0103tire \u00eenainte de ceremonie',
      'Reuniune de familie surprins\u0103 firesc \u00een ziua nun\u021bii',
      'Moment emo\u021bional \u00eentre miri, surprins natural',
      'Moment observat pe ringul de dans',
      'Lumin\u0103 \u0219i atmosfer\u0103 \u00een ziua nun\u021bii',
    ],
  },
};

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: 'easeOut' as const },
};

const ExperiencePreview = () => {
  const { language } = useLanguage();
  const c = copy[language as Lang];

  const [images, setImages] = useState<PortfolioImage[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Prefer featured (curated) then fill from full pool.
        const [featured, all] = await Promise.all([
          loadFeaturedImages(6).catch(() => [] as PortfolioImage[]),
          loadAllImages().catch(() => [] as PortfolioImage[]),
        ]);
        const seen = new Set<string | number>();
        const merged: PortfolioImage[] = [];
        for (const img of [...featured, ...all]) {
          if (seen.has(img.id)) continue;
          seen.add(img.id);
          merged.push(img);
          if (merged.length >= 6) break;
        }
        if (!cancelled) setImages(merged);
      } catch {
        if (!cancelled) setImages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const heroImg = images[0];
  const introImg = images[1];
  const blockImgs = [images[2], images[3], images[4]];
  const boundariesImg = images[5] ?? images[2];
  const closingImg = images[4] ?? images[0];

  const ImgOrSlot = ({
    img,
    alt,
    className,
    priority = false,
  }: { img?: PortfolioImage; alt: string; className?: string; priority?: boolean }) => {
    if (!img) {
      return (
        <div
          className={`bg-muted flex items-center justify-center text-muted-foreground text-xs tracking-wider uppercase ${className ?? ''}`}
          aria-label={alt}
        >
          {alt}
        </div>
      );
    }
    return (
      <img
        src={img.src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`w-full h-full object-cover ${className ?? ''}`}
      />
    );
  };

  return (
    <>
      <Helmet>
        <title>{c.meta.title}</title>
        <meta name="description" content={c.meta.description} />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={c.meta.title} />
        <meta property="og:description" content={c.meta.description} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'ro_RO'} />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative h-[90vh] min-h-[600px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ImgOrSlot img={heroImg} alt={c.alts[0]} priority />
            <div className="absolute inset-0 hero-gradient" />
          </div>
          <div className="relative z-10 container-wide px-6 lg:px-12 pb-20 md:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="max-w-3xl"
            >
              <p className="text-background/80 text-xs md:text-sm tracking-[0.25em] mb-6">
                {c.hero.label}
              </p>
              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl text-background leading-tight mb-6">
                {c.hero.heading}
              </h1>
              <p className="text-background/85 text-base md:text-lg max-w-xl leading-relaxed">
                {c.hero.body}
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ArrowDown className="text-background/60" size={22} />
            </motion.div>
          </motion.div>
        </section>

        {/* Intro editorial */}
        <section className="py-24 md:py-32">
          <div className="container-wide px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
              <motion.div {...fade} className="md:col-span-7 md:col-start-1">
                <div className="max-w-xl space-y-6 font-heading text-xl md:text-2xl leading-relaxed text-foreground">
                  {c.intro.slice(0, 2).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
              <motion.div {...fade} className="md:col-span-5 md:col-start-8">
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <ImgOrSlot img={introImg} alt={c.alts[1]} />
                </div>
              </motion.div>
              <motion.div {...fade} className="md:col-span-8 md:col-start-3 mt-4">
                <div className="max-w-2xl space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground">
                  {c.intro.slice(2).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What experience changes */}
        <section className="py-24 md:py-32 bg-card">
          <div className="container-wide px-6 lg:px-12">
            <motion.h2
              {...fade}
              className="font-heading text-3xl md:text-5xl mb-16 md:mb-24 max-w-2xl"
            >
              {c.blocksHeading}
            </motion.h2>

            <div className="space-y-24 md:space-y-32">
              {c.blocks.map((b, i) => {
                const img = blockImgs[i % blockImgs.length];
                const flip = i % 2 === 1;
                return (
                  <motion.div
                    key={b.h}
                    {...fade}
                    className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center"
                  >
                    <div className={`md:col-span-6 ${flip ? 'md:order-2' : ''}`}>
                      <div className="aspect-[4/5] w-full overflow-hidden">
                        <ImgOrSlot img={img} alt={c.alts[(i % 3) + 2]} />
                      </div>
                    </div>
                    <div className={`md:col-span-5 ${flip ? 'md:col-start-1 md:order-1' : 'md:col-start-8'}`}>
                      <p className="text-xs tracking-[0.25em] text-muted-foreground mb-4">
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className="font-heading text-2xl md:text-3xl mb-6 leading-tight">
                        {b.h}
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        {b.b}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Practical value */}
        <section className="py-24 md:py-32">
          <div className="container-wide px-6 lg:px-12">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 {...fade} className="font-heading text-3xl md:text-5xl mb-14">
                {c.practical.heading}
              </motion.h2>
              <motion.ul {...fade} className="divide-y divide-border/70 text-left">
                {c.practical.items.map((item, i) => (
                  <li
                    key={i}
                    className="py-5 flex items-baseline gap-6 font-heading text-xl md:text-2xl text-foreground"
                  >
                    <span className="text-muted-foreground text-sm tracking-[0.2em] w-10 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* Boundaries */}
        <section className="py-24 md:py-32 bg-card">
          <div className="container-wide px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
              <motion.div {...fade} className="md:col-span-6">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <ImgOrSlot img={boundariesImg} alt={c.alts[5]} />
                </div>
              </motion.div>
              <motion.div {...fade} className="md:col-span-6">
                <h2 className="font-heading text-3xl md:text-4xl mb-6 leading-tight max-w-md">
                  {c.boundaries.heading}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {c.boundaries.body}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ImgOrSlot img={closingImg} alt={c.alts[0]} />
            <div className="absolute inset-0 bg-foreground/40" />
          </div>
          <div className="relative z-10 container-wide px-6 lg:px-12 py-24 md:py-32">
            <motion.div {...fade} className="max-w-2xl mx-auto text-center">
              <div className="space-y-5 font-heading text-2xl md:text-3xl text-background leading-snug italic">
                {c.closing.lines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
              <div className="mt-12">
                <Button asChild variant="hero-light" size="lg">
                  <Link to="/contact">{c.closing.cta}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ExperiencePreview;