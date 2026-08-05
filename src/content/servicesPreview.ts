// ---------------------------------------------------------------------------
// Services page (preview) - CONTENT ONLY.
// Romanian is the canonical version. English is a straightforward draft
// translation, flagged via EN_IS_DRAFT so it can be refined before launch.
// Edit text here; components never hardcode copy.
// ---------------------------------------------------------------------------

export type Lang = 'en' | 'ro';

/** English copy on this page is a draft pending review. */
export const EN_IS_DRAFT = true;

/** Google Business Profile - update with the final reviews link. */
export const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=Jimmy+Hada+fotograf+nunta+Cluj-Napoca';

/** Centralised CTA wording - not final, easy to swap. */
export const CTA = {
  ro: {
    primary: 'Verifică disponibilitatea',
    primaryHref: '/contact',
    secondary: 'Vezi portofoliul',
    secondaryHref: '/portfolio',
  },
  en: {
    primary: 'Check availability',
    primaryHref: '/contact',
    secondary: 'View portfolio',
    secondaryHref: '/portfolio',
  },
} as const;

export type ServicesCopy = {
  seo: { title: string; description: string };
  hero: { label: string; title: string; body: string };
  wedding: { label: string; title: string; paragraphs: string[]; points: string[] };
  process: {
    label: string;
    title: string;
    intro: string;
    steps: { step: string; title: string; items: string[] }[];
  };
  deliverables: { label: string; title: string; body: string; items: string[] };
  optional: {
    label: string;
    title: string;
    intro: string;
    items: string[];
    partnerTitle: string;
    partnerNote: string;
    partnerItems: string[];
  };
  pricing: { label: string; title: string; price: string; body: string; note: string };
  testimonials: { label: string; title: string; reviewLabel: string; allReviews: string };
  faq: { label: string; title: string; items: { q: string; a: string }[] };
  finalCta: { title: string; body: string };
  links: { label: string; items: { label: string; href: string }[] };
};

// --- Testimonials: real Google Reviews. Never translated. -------------------
export type Testimonial = { name: string; quote: string; rating: 5 };

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Roxana Bîrsanuc',
    quote:
      'Ne-a cucerit de la primul «zâmbiți vă rog, ha ha». În cazul în care are cineva trac de cameră, el e omul care te face să uiți că ești fotografiat…',
    rating: 5,
  },
  {
    name: 'Nela Petria Mănășes',
    quote:
      'Un fotograf atent la detalii, profesionist, care creează o atmosferă relaxată, iar acest lucru se reflectă în cadre naturale, pline de emoție.',
    rating: 5,
  },
  {
    name: 'Alexandra Ivanciuc',
    quote:
      'Fotografii realiste, dar mai ales fotografii cu suflet. Surprind momentele pe care nu ai apucat să le vezi, dar pe care le poți păstra ca amintiri foarte dragi.',
    rating: 5,
  },
  {
    name: 'Amalia Boboc',
    quote:
      'Jimmy este un om cald, prietenos și în care îți poți pune toată încrederea că fotografiile vor rămâne amintiri de neuitat.',
    rating: 5,
  },
];

export const SERVICES_COPY: Record<Lang, ServicesCopy> = {
  // ========================= ROMANIAN (canonical) ==========================
  ro: {
    seo: {
      title: 'Servicii fotografie nuntă | Cluj-Napoca | Jimmy Hada',
      description:
        'Fotografie de nuntă în Cluj-Napoca. Acoperire discretă, fotografii naturale, galerie online privată. Pachetele de nuntă pornesc de la 700 €.',
    },
    hero: {
      label: 'Servicii',
      title: 'Ziua voastră, fotografiată așa cum s-a simțit',
      body:
        'Sunt aproape de voi pe tot parcursul zilei, fără să vă întrerup. Vă ghidez atunci când este util și vă las spațiu în restul timpului, astfel încât fotografiile să păstreze emoția reală a evenimentului.',
    },
    wedding: {
      label: 'Serviciul principal',
      title: 'Fotografie de nuntă',
      paragraphs: [
        'Acoperirea nunții începe de la pregătiri și continuă până în momentele de seară, în funcție de programul pe care îl stabilim împreună. Fotografiez ceremonia și momentele importante, dar și gesturile mici care se întâmplă între ele.',
        'Nu transform ziua într-o ședință foto continuă. Îndrumarea vine doar când ajută: la portretele de cuplu, la fotografiile de grup sau atunci când lumina cere o mică ajustare. În restul timpului rămân discret și las lucrurile să se întâmple firesc.',
      ],
      points: [
        'Acoperire completă a zilei, după programul stabilit împreună',
        'Prezență discretă, fără regie și fără poze forțate',
        'Îndrumare simplă și clară atunci când este nevoie',
        'Atenție atât momentelor importante, cât și detaliilor',
        'Portrete de cuplu relaxate, într-un ritm firesc',
        'Fotografii cu familia și invitații, fără agitație',
      ],
    },
    process: {
      label: 'Colaborare',
      title: 'Cum lucrăm împreună',
      intro:
        'De la prima discuție până la livrarea galeriei, fiecare etapă este clară, ca să știți la ce să vă așteptați.',
      steps: [
        {
          step: '01',
          title: 'Înainte de nuntă',
          items: [
            'O primă discuție despre eveniment și despre ce vă doriți',
            'Înțeleg planurile voastre, locațiile și atmosfera zilei',
            'Vă ajut cu programul, ca fotografia să nu grăbească nimic',
            'Răspund la întrebări, inclusiv la cele practice',
            'Pregătim împreună detaliile înainte de zi',
          ],
        },
        {
          step: '02',
          title: 'În ziua nunții',
          items: [
            'Acoperire discretă, fără să întrerup momentele',
            'Îndrumare doar atunci când este utilă',
            'Portrete de cuplu naturale, într-un ritm relaxat',
            'Interacțiuni autentice, așa cum se întâmplă',
            'Atenție invitaților, emoțiilor și atmosferei',
          ],
        },
        {
          step: '03',
          title: 'După nuntă',
          items: [
            'Selecția fotografiilor din întreaga zi',
            'Editare individuală, cu un aspect natural',
            'Galerie online privată, doar pentru voi',
            'Livrare cu descărcare și partajare simplă',
            'Galeria completă, de regulă în 3–4 săptămâni',
          ],
        },
      ],
    },
    deliverables: {
      label: 'Livrare',
      title: 'Ce primiți',
      body: 'Tot ce aveți nevoie ca fotografiile să fie ușor de păstrat, de folosit și de împărtășit.',
      items: [
        'Fotografii editate individual',
        'Galerie online privată',
        'Descărcare și partajare simplă',
        'Fișiere la rezoluție completă',
        'Fișiere pregătite pentru print',
        'Backup sigur al fotografiilor',
      ],
    },
    optional: {
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
      ],
      partnerTitle: 'Prin echipa colaboratoare',
      partnerNote:
        'Serviciile video, filmările cu drona și fotografia 360° sunt realizate împreună cu o echipă de încredere cu care lucrez constant, astfel încât acoperirea să fie completă și coerentă.',
      partnerItems: ['Servicii video', 'Filmări cu drona', 'Fotografie 360°'],
    },
    pricing: {
      label: 'Tarife',
      title: 'Transparență de la început',
      price: 'Pachetele de nuntă pornesc de la 700 €.',
      body:
        'Prețul final depinde de durata acoperirii, de locație și de serviciile suplimentare alese. Vă trimit detaliile complete după o scurtă discuție despre evenimentul vostru.',
      note: 'Pentru deplasări în afara Clujului, costurile se stabilesc în funcție de locație și durată.',
    },
    testimonials: {
      label: 'Recenzii',
      title: 'Ce spun cuplurile',
      reviewLabel: 'Recenzie Google',
      allReviews: 'Vezi toate recenziile pe Google',
    },
    faq: {
      label: 'Întrebări',
      title: 'Întrebări frecvente',
      items: [
        {
          q: 'Care este stilul tău de fotografie?',
          a: 'Îmi place să surprind ziua așa cum se întâmplă, cu emoțiile, gesturile și momentele ei reale. Intervin cât mai puțin în momentele importante și vă ghidez doar atunci când este nevoie, astfel încât fotografiile să rămână naturale și autentice.',
        },
        {
          q: 'Ne ajuți și cu poziționarea pentru fotografii?',
          a: 'Da. În cea mai mare parte a zilei vă las să fiți voi, fără să transform nunta într-o ședință foto continuă. Pentru portretele de cuplu și fotografiile de grup vă ofer însă îndrumare clară și simplă, astfel încât să vă simțiți relaxați și să arătați natural.',
        },
        {
          q: 'În cât timp primim fotografiile?',
          a: 'Galeria completă este livrată, de regulă, în 3–4 săptămâni de la eveniment. Termenul exact este stabilit de la început și menționat în contract, astfel încât să știți clar când veți primi fotografiile.',
        },
        {
          q: 'Cum putem rezerva data?',
          a: 'Rezervarea începe cu o scurtă discuție despre eveniment și disponibilitatea datei. După confirmarea colaborării, primiți toate informațiile necesare pentru rezervare.',
        },
        {
          q: 'Oferi și alte servicii?',
          a: 'Da. Fotografiez și botezuri, evenimente private și evenimente corporate. Pentru nunți și alte evenimente pot lucra împreună cu o echipă care oferă servicii video, filmări cu drona și fotografii 360°, astfel încât să puteți avea o acoperire completă și coerentă.',
        },
        {
          q: 'Ce se întâmplă dacă nu ne simțim confortabil în fața camerei?',
          a: 'Este una dintre cele mai frecvente temeri și este absolut normală. Nu trebuie să știți să pozați. Vă ghidez discret atunci când este nevoie și vă las spațiu în restul timpului, astfel încât fotografiile să surprindă interacțiunea dintre voi, nu o versiune rigidă a ei.',
        },
        {
          q: 'Te deplasezi și în afara Clujului?',
          a: 'Da. Fotografiez evenimente atât în Cluj-Napoca, cât și în alte orașe sau în afara țării. Pentru deplasări, costurile se stabilesc în funcție de locație, distanță și durata evenimentului.',
        },
        {
          q: 'Ce se întâmplă dacă plouă?',
          a: 'Ploaia nu înseamnă că fotografiile sunt compromise. Adaptăm planul, folosim spațiile disponibile și găsim soluții potrivite pentru lumină și atmosferă. Important este să păstrăm flexibilitatea, nu să forțăm un scenariu care nu mai funcționează.',
        },
      ],
    },
    finalCta: {
      title: 'Verificăm dacă data voastră este liberă?',
      body:
        'Fotografiez un număr limitat de nunți pe an, ca să pot fi complet prezent la fiecare. Scrieți-mi câteva detalii despre ziua voastră și vă răspund cu disponibilitatea și detaliile de preț.',
    },
    links: {
      label: 'Continuă',
      items: [
        { label: 'Portofoliu', href: '/portfolio' },
        { label: 'Nunți', href: '/portfolio/weddings' },
        { label: 'Botezuri și evenimente', href: '/portfolio/events' },
        { label: 'Experiență', href: '/experience' },
        { label: 'Prima pagină', href: '/' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  },

  // ========================== ENGLISH (draft) ==============================
  en: {
    seo: {
      title: 'Wedding Photography Services | Cluj-Napoca | Jimmy Hada',
      description:
        'Wedding photography in Cluj-Napoca. Discreet coverage, natural photographs, private online gallery. Wedding packages start from €700.',
    },
    hero: {
      label: 'Services',
      title: 'Your day, photographed the way it felt',
      body:
        'I stay close to you throughout the day without interrupting it. I offer guidance when it helps and give you space the rest of the time, so the photographs keep the real emotion of the day.',
    },
    wedding: {
      label: 'Main service',
      title: 'Wedding photography',
      paragraphs: [
        'Coverage starts with the preparations and continues into the evening, following the schedule we agree on together. I photograph the ceremony and the important moments, as well as the small gestures that happen in between.',
        'I never turn the day into a continuous photo session. Guidance comes only when it helps: couple portraits, group photographs, or when the light needs a small adjustment. The rest of the time I stay discreet and let things happen naturally.',
      ],
      points: [
        'Full coverage of the day, following the agreed schedule',
        'A discreet presence, with no staging or forced poses',
        'Simple, clear guidance whenever it is needed',
        'Attention to the important moments and to the details',
        'Relaxed couple portraits, at a natural pace',
        'Family and guest photographs, without the rush',
      ],
    },
    process: {
      label: 'Working together',
      title: 'How we work together',
      intro:
        'From our first conversation to the delivery of your gallery, every step is clear, so you always know what to expect.',
      steps: [
        {
          step: '01',
          title: 'Before the wedding',
          items: [
            'An initial conversation about the day and what you want',
            'Understanding your plans, locations and the atmosphere',
            'Timeline guidance, so photography never rushes anything',
            'Answers to your questions, including practical ones',
            'Preparing the details together before the day',
          ],
        },
        {
          step: '02',
          title: 'On the wedding day',
          items: [
            'Discreet coverage that does not interrupt the moments',
            'Guidance only when it is genuinely useful',
            'Natural couple portraits, at a relaxed pace',
            'Authentic interactions, exactly as they happen',
            'Attention to guests, emotions and atmosphere',
          ],
        },
        {
          step: '03',
          title: 'After the wedding',
          items: [
            'A selection of photographs from the whole day',
            'Individual editing, with a natural look',
            'A private online gallery, just for you',
            'Delivery with easy download and sharing',
            'The complete gallery, usually within 3–4 weeks',
          ],
        },
      ],
    },
    deliverables: {
      label: 'Delivery',
      title: "What you'll receive",
      body: 'Everything you need to keep, use and share your photographs easily.',
      items: [
        'Individually edited photographs',
        'Private online gallery',
        'Easy download and sharing',
        'Full-resolution files',
        'Print-ready files',
        'Secure backup',
      ],
    },
    optional: {
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
      ],
      partnerTitle: 'Through the collaborating team',
      partnerNote:
        'Video, drone footage and 360° photography are provided together with a trusted team I work with regularly, so your coverage stays complete and consistent.',
      partnerItems: ['Video services', 'Drone footage', '360° photography'],
    },
    pricing: {
      label: 'Pricing',
      title: 'Transparent from the start',
      price: 'Wedding packages start from €700.',
      body:
        'The final price depends on the length of coverage, the location and any additional services. I send full details after a short conversation about your day.',
      note: 'For travel outside Cluj, costs are set based on location and duration.',
    },
    testimonials: {
      label: 'Reviews',
      title: 'What couples say',
      reviewLabel: 'Google Review',
      allReviews: 'See all reviews on Google',
    },
    faq: {
      label: 'Questions',
      title: 'Frequently asked questions',
      items: [
        {
          q: 'What is your photography style?',
          a: 'I like to capture the day as it happens, with its real emotions, gestures and moments. I interfere as little as possible during the important moments and guide you only when needed, so the photographs stay natural and authentic.',
        },
        {
          q: 'Do you help us with posing?',
          a: 'Yes. For most of the day I let you be yourselves, without turning the wedding into a continuous photo session. For couple portraits and group photographs I do give clear, simple guidance, so you feel relaxed and look natural.',
        },
        {
          q: 'How soon do we receive the photographs?',
          a: 'The complete gallery is usually delivered within 3–4 weeks after the event. The exact timeline is agreed from the start and stated in the contract, so you know clearly when you will receive your photographs.',
        },
        {
          q: 'How can we book our date?',
          a: 'Booking starts with a short conversation about the event and the availability of your date. Once we confirm working together, you receive all the information needed for the booking.',
        },
        {
          q: 'Do you offer other services?',
          a: 'Yes. I also photograph baptisms, private events and corporate events. For weddings and other events I can work together with a team that provides video, drone footage and 360° photography, so you can have complete and consistent coverage.',
        },
        {
          q: "What if we don't feel comfortable in front of the camera?",
          a: 'This is one of the most common worries and it is completely normal. You do not need to know how to pose. I guide you discreetly when needed and give you space the rest of the time, so the photographs capture the interaction between you, not a stiff version of it.',
        },
        {
          q: 'Do you travel outside Cluj?',
          a: 'Yes. I photograph events in Cluj-Napoca as well as in other cities and abroad. For travel, costs are set based on location, distance and the duration of the event.',
        },
        {
          q: 'What happens if it rains?',
          a: 'Rain does not mean the photographs are compromised. We adapt the plan, use the available spaces and find suitable solutions for light and atmosphere. What matters is staying flexible instead of forcing a plan that no longer works.',
        },
      ],
    },
    finalCta: {
      title: 'Shall we check if your date is free?',
      body:
        'I photograph a limited number of weddings each year, so I can be fully present at every one. Send me a few details about your day and I will reply with availability and pricing details.',
    },
    links: {
      label: 'Continue',
      items: [
        { label: 'Portfolio', href: '/portfolio' },
        { label: 'Weddings', href: '/portfolio/weddings' },
        { label: 'Baptisms & events', href: '/portfolio/events' },
        { label: 'Experience', href: '/experience' },
        { label: 'Home', href: '/' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  },
};
