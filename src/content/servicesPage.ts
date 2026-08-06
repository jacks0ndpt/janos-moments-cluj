// ---------------------------------------------------------------------------
// Services page — DEFAULT (approved) bilingual content.
// Romanian is canonical; English mirrors it closely.
// Admin-saved content is deep-merged over these defaults, so the page can
// never render empty. Components never hardcode copy.
// ---------------------------------------------------------------------------

export type Lang = 'en' | 'ro';

/** Google Business Profile reviews link. */
export const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=Jimmy+Hada+fotograf+nunta+Cluj-Napoca';

// --- Sections --------------------------------------------------------------

export const SERVICES_SECTIONS = [
  'hero',
  'service',
  'pricing',
  'process',
  'reviews',
  'extras',
  'finalCta',
] as const;
export type ServicesSectionKey = (typeof SERVICES_SECTIONS)[number];

export const SECTION_LABELS: Record<ServicesSectionKey, string> = {
  hero: 'Hero',
  service: 'Main service & deliverables',
  pricing: 'Pricing',
  process: 'How we work together',
  reviews: 'Reviews',
  extras: 'Additional services & FAQ',
  finalCta: 'Final CTA',
};

// --- Images ----------------------------------------------------------------

export const SERVICES_SLOTS = ['hero', 'service'] as const;
export type ServicesSlotKey = (typeof SERVICES_SLOTS)[number];

export const SLOT_LABELS: Record<ServicesSlotKey, { en: string; ro: string }> = {
  hero: { en: 'Hero image', ro: 'Imagine hero' },
  service: { en: 'Main service image', ro: 'Imagine serviciu principal' },
};

export type FocalPoint = { x: number; y: number };

export type ServicesSlot = {
  imageId: string | null;
  mobileImageId: string | null;
  focal: FocalPoint;
  mobileFocal: FocalPoint;
  altRo: string;
  altEn: string;
};

export const DEFAULT_SLOT: ServicesSlot = {
  imageId: null,
  mobileImageId: null,
  focal: { x: 50, y: 50 },
  mobileFocal: { x: 50, y: 35 },
  altRo: '',
  altEn: '',
};

export const DEFAULT_SLOT_ALTS: Record<ServicesSlotKey, { en: string; ro: string }> = {
  hero: {
    en: 'Wedding photography in Cluj-Napoca',
    ro: 'Fotografie de nuntă în Cluj-Napoca',
  },
  service: {
    en: 'Candid wedding moment during the ceremony',
    ro: 'Moment autentic de nuntă în timpul ceremoniei',
  },
};

// --- Reviews (real Google Reviews — never translated, never rewritten) -----

export type Review = { id: string; name: string; quote: string; rating: 5 };

export const REVIEWS: Review[] = [
  {
    id: 'roxana',
    name: 'Roxana Bîrsanuc',
    quote:
      'Ne-a cucerit de la primul «zâmbiți vă rog, ha ha». În cazul în care are cineva trac de cameră, el e omul care te face să uiți că ești fotografiat…',
    rating: 5,
  },
  {
    id: 'nela',
    name: 'Nela Petria Mănășes',
    quote:
      'Un fotograf atent la detalii, profesionist, care creează o atmosferă relaxată, iar acest lucru se reflectă în cadre naturale, pline de emoție.',
    rating: 5,
  },
  {
    id: 'alexandra',
    name: 'Alexandra Ivanciuc',
    quote:
      'Fotografii realiste, dar mai ales fotografii cu suflet. Surprind momentele pe care nu ai apucat să le vezi, dar pe care le poți păstra ca amintiri foarte dragi.',
    rating: 5,
  },
  {
    id: 'amalia',
    name: 'Amalia Boboc',
    quote:
      'Jimmy este un om cald, prietenos și în care îți poți pune toată încrederea că fotografiile vor rămâne amintiri de neuitat.',
    rating: 5,
  },
];

/** Featured reviews shown on the page (order matters, 2 by default). */
export const DEFAULT_FEATURED_REVIEWS = ['roxana', 'nela'];

// --- Content ---------------------------------------------------------------

export type ServicesContent = {
  nav: { service: string; pricing: string; process: string; reviews: string; faq: string };
  hero: {
    label: string;
    title: string;
    body: string;
    price: string;
    availability: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  service: {
    label: string;
    title: string;
    intro: string;
    benefits: string[];
    deliverablesTitle: string;
    deliverables: string[];
    moreLabel: string;
    moreItems: string[];
  };
  pricing: {
    label: string;
    title: string;
    price: string;
    body: string;
    factors: string[];
    note: string;
    ctaLabel: string;
    ctaHref: string;
  };
  process: {
    label: string;
    title: string;
    steps: { step: string; title: string; body: string }[];
    detailsLabel: string;
    detailsItems: string[];
  };
  reviews: { label: string; title: string; reviewLabel: string; allReviews: string; featured: string[] };
  extras: { label: string; title: string; intro: string; items: string[]; partnerNote: string };
  faq: { label: string; title: string; items: { q: string; a: string }[] };
  finalCta: {
    label: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export type ServicesSeo = { title: string; description: string };

export const DEFAULT_SEO: Record<Lang, ServicesSeo> = {
  ro: {
    title: 'Prețuri Fotograf Nuntă | Cluj-Napoca | Jimmy Hada',
    description:
      'Pachete fotografie nuntă în Cluj-Napoca de la 700 EUR. Acoperire discretă, fotografii naturale, galerie online privată. Solicită disponibilitatea.',
  },
  en: {
    title: 'Wedding Photography Pricing | Cluj-Napoca | Jimmy Hada',
    description:
      'Wedding photography packages in Cluj-Napoca from €700. Discreet coverage, natural photographs, private online gallery. Check availability.',
  },
};

export const DEFAULT_CONTENT: Record<Lang, ServicesContent> = {
  // ========================= ROMANIAN (canonical) =========================
  ro: {
    nav: {
      service: 'Serviciu',
      pricing: 'Tarife',
      process: 'Proces',
      reviews: 'Recenzii',
      faq: 'Întrebări',
    },
    hero: {
      label: 'Servicii',
      title: 'Ziua voastră, fotografiată așa cum s-a simțit',
      body:
        'Sunt aproape de voi pe tot parcursul zilei, fără să vă întrerup. Vă ghidez atunci când este util și vă las spațiu în restul timpului.',
      price: 'Pachetele de nuntă pornesc de la 700 EUR.',
      availability:
        'Fotografiez 5–8 nunți pe an, ca să pot fi complet implicat la fiecare.',
      ctaLabel: 'Verifică disponibilitatea',
      ctaHref: '/contact',
      secondaryLabel: 'Vezi portofoliul',
      secondaryHref: '/portfolio',
    },
    service: {
      label: 'Serviciul principal',
      title: 'Fotografie de nuntă',
      intro:
        'Acoperirea începe de la pregătiri și continuă până în momentele de seară, după programul stabilit împreună. Fotografiez momentele importante, dar și gesturile mici care se întâmplă între ele.',
      benefits: [
        'Acoperire completă a zilei, după programul stabilit împreună',
        'Prezență discretă, fără regie și fără poze forțate',
        'Îndrumare simplă și clară atunci când este nevoie',
        'Atenție oamenilor, emoției și detaliilor',
      ],
      deliverablesTitle: 'Ce primiți',
      deliverables: [
        'Fotografii editate individual',
        'Galerie online privată',
        'Fișiere la rezoluție completă',
        'Galeria completă, de regulă în 3–4 săptămâni',
      ],
      moreLabel: 'Vezi toate detaliile',
      moreItems: [
        'Descărcare și partajare simplă',
        'Fișiere pregătite pentru print',
        'Backup sigur al fotografiilor',
        'Portrete de cuplu relaxate, într-un ritm firesc',
        'Fotografii cu familia și invitații, fără agitație',
      ],
    },
    pricing: {
      label: 'Tarife',
      title: 'Transparență de la început',
      price: 'Pachetele de nuntă pornesc de la 700 EUR.',
      body: 'Prețul final depinde de câteva detalii ale evenimentului vostru:',
      factors: [
        'Durata acoperirii',
        'Locația evenimentului',
        'Serviciile suplimentare alese',
        'Deplasările în afara Clujului, în funcție de locație și durată',
      ],
      note: 'Vă trimit detaliile complete după o scurtă discuție despre evenimentul vostru.',
      ctaLabel: 'Verifică disponibilitatea',
      ctaHref: '/contact',
    },
    process: {
      label: 'Colaborare',
      title: 'Cum lucrăm împreună',
      steps: [
        {
          step: '01',
          title: 'Ne cunoaștem',
          body:
            'O scurtă discuție despre eveniment și despre disponibilitatea datei, apoi vă ajut cu programul zilei.',
        },
        {
          step: '02',
          title: 'Trăiți ziua',
          body:
            'Acoperire discretă, fără să întrerup momentele, cu îndrumare doar atunci când este utilă.',
        },
        {
          step: '03',
          title: 'Primiți galeria',
          body:
            'Fotografii editate individual, într-o galerie online privată, de regulă în 3–4 săptămâni.',
        },
      ],
      detailsLabel: 'Ce discutăm înainte de nuntă',
      detailsItems: [
        'Programul zilei',
        'Locațiile și timpii de deplasare',
        'Persoanele importante',
        'Fotografiile de grup',
        'Detaliile logistice',
        'Planul pentru lumină și vreme',
      ],
    },
    reviews: {
      label: 'Recenzii',
      title: 'Ce spun cuplurile',
      reviewLabel: 'Recenzie Google',
      allReviews: 'Vezi toate recenziile pe Google',
      featured: [...DEFAULT_FEATURED_REVIEWS],
    },
    extras: {
      label: 'Opțional',
      title: 'Servicii suplimentare',
      intro: 'Se pot adăuga la nuntă sau pot fi rezervate separat, în funcție de ce aveți nevoie.',
      items: [
        'Save the Date / ședință de logodnă',
        'Cununie civilă',
        'Fotografie de botez',
        'Evenimente private',
        'Evenimente corporate',
        'Ore suplimentare de acoperire',
        'Al doilea fotograf',
        'Servicii video, filmări cu drona și fotografie 360°',
      ],
      partnerNote:
        'Serviciile video, filmările cu drona și fotografia 360° sunt disponibile prin echipa colaboratoare de încredere cu care lucrez constant, pe bază de ofertă personalizată.',
    },
    faq: {
      label: 'Întrebări',
      title: 'Întrebări frecvente',
      items: [
        {
          q: 'Care este stilul tău de fotografie?',
          a: 'Surprind ziua așa cum se întâmplă, cu emoțiile și gesturile ei reale. Intervin cât mai puțin în momentele importante, astfel încât fotografiile să rămână naturale.',
        },
        {
          q: 'Ce înseamnă acoperirea completă a zilei?',
          a: 'Acoperirea începe de la pregătiri și continuă până în momentele de seară, după programul stabilit împreună.',
        },
        {
          q: 'În cât timp primim fotografiile?',
          a: 'Galeria completă este livrată, de regulă, în 3–4 săptămâni de la eveniment. Termenul exact este menționat în contract.',
        },
        {
          q: 'Cum putem rezerva data?',
          a: 'Rezervarea începe cu o scurtă discuție despre eveniment și disponibilitatea datei. După confirmarea colaborării, primiți toate informațiile necesare pentru rezervare.',
        },
        {
          q: 'Ce se întâmplă dacă nu ne simțim confortabil în fața camerei?',
          a: 'Nu trebuie să știți să pozați. Vă ghidez discret atunci când este nevoie și vă las spațiu în restul timpului, astfel încât fotografiile să surprindă interacțiunea dintre voi.',
        },
        {
          q: 'Te deplasezi și în afara Clujului?',
          a: 'Da, atât în alte orașe, cât și în afara țării. Costurile de deplasare se stabilesc în funcție de locație, distanță și durata evenimentului.',
        },
        {
          q: 'Ce se întâmplă dacă plouă?',
          a: 'Adaptăm planul, folosim spațiile disponibile și găsim soluții potrivite pentru lumină și atmosferă. Ploaia nu compromite fotografiile.',
        },
        {
          q: 'Oferi și alte servicii?',
          a: 'Da. Fotografiez și botezuri, evenimente private și evenimente corporate. Pentru servicii video, filmări cu drona și fotografii 360° lucrez împreună cu o echipă colaboratoare de încredere.',
        },
      ],
    },
    finalCta: {
      label: 'Disponibilitate',
      title: 'Verificăm dacă data voastră este liberă?',
      body:
        'Scrieți-mi data nunții, locația și câteva detalii despre eveniment, iar vă răspund cu disponibilitatea și detaliile de preț.',
      ctaLabel: 'Verifică disponibilitatea',
      ctaHref: '/contact',
      secondaryLabel: 'Vezi portofoliul',
      secondaryHref: '/portfolio',
    },
  },

  // ============================== ENGLISH ================================
  en: {
    nav: {
      service: 'Service',
      pricing: 'Pricing',
      process: 'Process',
      reviews: 'Reviews',
      faq: 'Questions',
    },
    hero: {
      label: 'Services',
      title: 'Your day, photographed the way it felt',
      body:
        'I stay close to you throughout the day without interrupting it. I offer guidance when it helps and give you space the rest of the time.',
      price: 'Wedding packages start from €700.',
      availability:
        'I photograph 5–8 weddings a year, so I can be fully involved in every one.',
      ctaLabel: 'Check availability',
      ctaHref: '/contact',
      secondaryLabel: 'View portfolio',
      secondaryHref: '/portfolio',
    },
    service: {
      label: 'Main service',
      title: 'Wedding photography',
      intro:
        'Coverage starts with the preparations and continues into the evening, following the schedule we agree on together. I photograph the important moments as well as the small gestures in between.',
      benefits: [
        'Full coverage of the day, following the agreed schedule',
        'A discreet presence, with no staging or forced poses',
        'Simple, clear guidance whenever it is needed',
        'Attention to people, emotion and details',
      ],
      deliverablesTitle: "What you'll receive",
      deliverables: [
        'Individually edited photographs',
        'Private online gallery',
        'Full-resolution files',
        'The complete gallery, usually within 3–4 weeks',
      ],
      moreLabel: 'See all details',
      moreItems: [
        'Easy download and sharing',
        'Print-ready files',
        'Secure backup',
        'Relaxed couple portraits, at a natural pace',
        'Family and guest photographs, without the rush',
      ],
    },
    pricing: {
      label: 'Pricing',
      title: 'Transparent from the start',
      price: 'Wedding packages start from €700.',
      body: 'The final price depends on a few details of your day:',
      factors: [
        'The length of coverage',
        'The location of the event',
        'Any additional services chosen',
        'Travel outside Cluj, based on location and duration',
      ],
      note: 'I send full details after a short conversation about your event.',
      ctaLabel: 'Check availability',
      ctaHref: '/contact',
    },
    process: {
      label: 'Working together',
      title: 'How we work together',
      steps: [
        {
          step: '01',
          title: 'We get to know each other',
          body:
            'A short conversation about the event and the availability of your date, then timeline guidance for the day.',
        },
        {
          step: '02',
          title: 'You live your day',
          body:
            'Discreet coverage that does not interrupt the moments, with guidance only when it is genuinely useful.',
        },
        {
          step: '03',
          title: 'You receive the gallery',
          body:
            'Individually edited photographs in a private online gallery, usually within 3–4 weeks.',
        },
      ],
      detailsLabel: 'What we discuss before the wedding',
      detailsItems: [
        'The schedule of the day',
        'Locations and travel times',
        'The key people',
        'Group photographs',
        'Logistics',
        'Light and weather planning',
      ],
    },
    reviews: {
      label: 'Reviews',
      title: 'What couples say',
      reviewLabel: 'Google Review',
      allReviews: 'See all reviews on Google',
      featured: [...DEFAULT_FEATURED_REVIEWS],
    },
    extras: {
      label: 'Optional',
      title: 'Additional services',
      intro: 'These can be added to a wedding or booked separately, depending on what you need.',
      items: [
        'Save the Date / engagement session',
        'Civil ceremony',
        'Baptism photography',
        'Private events',
        'Corporate events',
        'Additional coverage hours',
        'Second photographer',
        'Video, drone footage and 360° photography',
      ],
      partnerNote:
        'Video, drone footage and 360° photography are available through the trusted collaborating team I work with regularly, subject to a personalised proposal.',
    },
    faq: {
      label: 'Questions',
      title: 'Frequently asked questions',
      items: [
        {
          q: 'What is your photography style?',
          a: 'I capture the day as it happens, with its real emotions and gestures. I interfere as little as possible during the important moments, so the photographs stay natural.',
        },
        {
          q: 'What does full-day coverage mean?',
          a: 'Coverage starts with the preparations and continues into the evening, following the schedule we agree on together.',
        },
        {
          q: 'How soon do we receive the photographs?',
          a: 'The complete gallery is usually delivered within 3–4 weeks after the event. The exact timeline is stated in the contract.',
        },
        {
          q: 'How can we book our date?',
          a: 'Booking starts with a short conversation about the event and the availability of your date. Once we confirm working together, you receive all the information needed for the booking.',
        },
        {
          q: "What if we don't feel comfortable in front of the camera?",
          a: 'You do not need to know how to pose. I guide you discreetly when needed and give you space the rest of the time, so the photographs capture the interaction between you.',
        },
        {
          q: 'Do you travel outside Cluj?',
          a: 'Yes, to other cities and abroad. Travel costs are set based on location, distance and the duration of the event.',
        },
        {
          q: 'What happens if it rains?',
          a: 'We adapt the plan, use the available spaces and find suitable solutions for light and atmosphere. Rain does not compromise the photographs.',
        },
        {
          q: 'Do you offer other services?',
          a: 'Yes. I also photograph baptisms, private events and corporate events. For video, drone footage and 360° photography I work together with a trusted collaborating team.',
        },
      ],
    },
    finalCta: {
      label: 'Availability',
      title: 'Shall we check if your date is free?',
      body:
        'Send me your wedding date, the location and a few details about the event, and I will reply with availability and pricing details.',
      ctaLabel: 'Check availability',
      ctaHref: '/contact',
      secondaryLabel: 'View portfolio',
      secondaryHref: '/portfolio',
    },
  },
};
