// Default (approved) bilingual copy for the public Experience page.
// Admin-saved content is deep-merged over these defaults, so nothing ever
// disappears if a field is left empty in Admin.

export type Lang = 'en' | 'ro';

export type ExperienceContent = {
  hero: { label: string; heading: string; body: string };
  intro: { p1: string; p2: string; p3: string; p4: string };
  blocksHeading: string;
  blocks: {
    before: { h: string; b: string };
    during: { h: string; b: string };
    plansChange: { h: string; b: string };
    present: { h: string; b: string };
  };
  practical: { heading: string; items: string[] };
  boundaries: { heading: string; body: string };
  closing: { line1: string; line2: string; line3: string; cta: string };
  teaser: { label: string; heading: string; body: string; cta: string };
};

export type ExperienceSeo = { title: string; description: string };

export const EXPERIENCE_SLOTS = [
  'hero',
  'intro',
  'before',
  'during',
  'plansChange',
  'closing',
  'teaser',
] as const;
export type ExperienceSlotKey = (typeof EXPERIENCE_SLOTS)[number];

export const SLOT_LABELS: Record<ExperienceSlotKey, { en: string; ro: string }> = {
  hero: { en: 'Hero image', ro: 'Imagine hero' },
  intro: { en: 'Introduction image', ro: 'Imagine introducere' },
  before: { en: 'Before the wedding image', ro: 'Imagine „Înainte de nuntă”' },
  during: { en: 'During the wedding image', ro: 'Imagine „În timpul nunții”' },
  plansChange: { en: 'When plans change image', ro: 'Imagine „Când planurile se schimbă”' },
  closing: { en: 'Closing image', ro: 'Imagine final' },
  teaser: { en: 'Homepage teaser image', ro: 'Imagine teaser homepage' },
};

export type FocalPoint = { x: number; y: number };

export type ExperienceSlot = {
  imageId: string | null;
  mobileImageId: string | null;
  focal: FocalPoint;
  mobileFocal: FocalPoint;
  altRo: string;
  altEn: string;
  decorative?: boolean;
};

export const DEFAULT_SLOT: ExperienceSlot = {
  imageId: null,
  mobileImageId: null,
  focal: { x: 50, y: 50 },
  mobileFocal: { x: 50, y: 35 },
  altRo: '',
  altEn: '',
};

export const DEFAULT_SLOT_ALTS: Record<ExperienceSlotKey, { en: string; ro: string }> = {
  hero: {
    en: 'Documentary wedding moment captured in Cluj-Napoca',
    ro: 'Moment documentar de nuntă în Cluj-Napoca',
  },
  intro: {
    en: 'Quiet preparation moment before the ceremony',
    ro: 'Moment liniștit de pregătire înainte de ceremonie',
  },
  before: {
    en: 'Unposed family gathering during a wedding day',
    ro: 'Reuniune de familie surprinsă firesc în ziua nunții',
  },
  during: {
    en: 'Candid emotional moment between the couple',
    ro: 'Moment emoțional între miri, surprins natural',
  },
  plansChange: {
    en: 'Observed moment on the wedding dance floor',
    ro: 'Moment observat pe ringul de dans',
  },
  closing: {
    en: 'Wedding day light and atmosphere',
    ro: 'Lumină și atmosferă în ziua nunții',
  },
  teaser: {
    en: 'Calm guidance during a candid wedding moment',
    ro: 'Îndrumare calmă într-un moment autentic de nuntă',
  },
};

export const DEFAULT_SEO: Record<Lang, ExperienceSeo> = {
  en: {
    title: 'More Than Wedding Photography | Jimmy Hada',
    description:
      'Discover how experience, calm guidance and thoughtful preparation can shape both your wedding photographs and the way your wedding day feels.',
  },
  ro: {
    title: 'Mai mult decât fotografie de nuntă | Jimmy Hada',
    description:
      'Descoperiți cum experiența, îndrumarea calmă și pregătirea atentă pot influența atât fotografiile, cât și felul în care se simte ziua nunții.',
  },
};

export const DEFAULT_CONTENT: Record<Lang, ExperienceContent> = {
  en: {
    hero: {
      label: 'BEYOND THE PHOTOGRAPHS',
      heading: 'Your wedding should feel like a wedding, not a photoshoot.',
      body: 'The photographs are the final result. But the experience, judgement and decisions behind them can shape how naturally the entire day unfolds.',
    },
    intro: {
      p1: 'For much of the day, your photographer will be only a few steps away.',
      p2: 'Present during the nerves before the ceremony, the embraces afterwards, the family photographs, the unexpected delays, the quiet pauses and the energy of the dance floor.',
      p3: 'That closeness comes with responsibility.',
      p4: 'An experienced photographer does not simply document a plan already made. He works within it, adapting to changing light, delayed schedules, family dynamics, weather and the natural unpredictability of a wedding.',
    },
    blocksHeading: 'What experience changes',
    blocks: {
      before: {
        h: 'Before the wedding',
        b: 'Experience begins before the camera is lifted. A thoughtful review of the timeline, locations, travel time and available light can prevent unnecessary pressure later and help photography fit naturally around the wedding.',
      },
      during: {
        h: 'During the wedding',
        b: 'Some moments benefit from clear guidance. Others need silence and space. Experience means recognising the difference, helping when necessary and disappearing into the background when the moment already speaks for itself.',
      },
      plansChange: {
        h: 'When plans change',
        b: 'Weddings rarely follow every minute of the schedule. Weather changes, ceremonies run late and people are not always where they are expected to be. Experience allows those situations to be handled calmly, without transferring the pressure to the couple.',
      },
      present: {
        h: 'So you can remain present',
        b: 'You should not spend your wedding wondering where to stand, what happens next or whether an important moment is being missed. The photographer\u2019s role is to notice, anticipate and preserve the story while giving you space to live it.',
      },
    },
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
      line1: 'You remain present with the people you love.',
      line2: 'I notice, anticipate and preserve the story around you.',
      line3: 'The photographs are the result, but the way we reach them matters too.',
      cta: 'Tell me about your wedding',
    },
    teaser: {
      label: 'BEYOND THE PHOTOGRAPHS',
      heading: 'Your wedding should feel like a wedding, not a photoshoot.',
      body: 'Your photographer is beside you through some of the most emotional and unpredictable parts of the day. Experience means knowing when to guide, when to step back and how to adapt without adding pressure.',
      cta: 'Discover the experience',
    },
  },
  ro: {
    hero: {
      label: 'DINCOLO DE FOTOGRAFII',
      heading: 'Nunta voastră ar trebui să se simtă ca o nuntă, nu ca o ședință foto.',
      body: 'Fotografiile sunt rezultatul final. Însă experiența, deciziile și atenția din spatele lor pot influența felul în care întreaga zi se desfășoară firesc.',
    },
    intro: {
      p1: 'Pe parcursul unei mari părți din zi, fotograful vostru va fi la doar câțiva pași distanță.',
      p2: 'Va fi aproape în momentele încărcate de emoție dinaintea ceremoniei, în îmbrățișările de după, în timpul fotografiilor de familie, al întârzierilor neașteptate, al momentelor liniștite și al energiei de pe ringul de dans.',
      p3: 'Această apropiere vine cu responsabilitate.',
      p4: 'Un fotograf cu experiență nu vine doar să documenteze un program deja stabilit. Lucrează în interiorul lui, adaptându-se luminii, întârzierilor, dinamicii familiei, vremii și imprevizibilului firesc al unei nunți.',
    },
    blocksHeading: 'Ce schimbă experiența',
    blocks: {
      before: {
        h: 'Înainte de nuntă',
        b: 'Experiența începe înainte ca aparatul foto să fie ridicat. O analiză atentă a programului, locațiilor, timpilor de deplasare și luminii disponibile poate evita presiunea inutilă și poate integra fotografia firesc în ziua nunții.',
      },
      during: {
        h: 'În timpul nunții',
        b: 'Unele momente au nevoie de îndrumare clară. Altele au nevoie de liniște și spațiu. Experiența înseamnă să recunoști diferența, să ajuți atunci când este nevoie și să te retragi atunci când momentul vorbește deja de la sine.',
      },
      plansChange: {
        h: 'Când planurile se schimbă',
        b: 'Nunțile respectă rar fiecare minut al programului. Vremea se schimbă, ceremoniile întârzie, iar oamenii nu sunt întotdeauna acolo unde ar trebui să fie. Experiența permite gestionarea calmă a acestor situații, fără ca presiunea să ajungă la miri.',
      },
      present: {
        h: 'Ca voi să puteți rămâne prezenți',
        b: 'Nu ar trebui să vă petreceți nunta întrebându-vă unde să stați, ce urmează sau dacă un moment important este ratat. Rolul fotografului este să observe, să anticipeze și să păstreze povestea, oferindu-vă în același timp spațiul de a o trăi.',
      },
    },
    practical: {
      heading: 'Experiența vă poate ajuta să',
      items: [
        'construiți un program mai realist',
        'evitați graba inutilă',
        'vă simțiți mai confortabil în fața camerei',
        'organizați eficient fotografiile de familie',
        'păstrați mai mult timp pentru invitați',
        'vă adaptați calm atunci când planurile se schimbă',
        'aveți încredere că momentele importante sunt observate',
      ],
    },
    boundaries: {
      heading: 'Îndrumare, fără a prelua controlul',
      body: 'Scopul nu este de a controla nunta sau de a o transforma într-o producție. Scopul este de a oferi experiență, claritate și calm atunci când sunt utile, lăsând ziua să rămână a voastră.',
    },
    closing: {
      line1: 'Voi rămâneți prezenți alături de oamenii pe care îi iubiți.',
      line2: 'Eu observ, anticipez și păstrez povestea din jurul vostru.',
      line3: 'Fotografiile sunt rezultatul, dar și felul în care ajungem la ele contează.',
      cta: 'Povestiți-mi despre nunta voastră',
    },
    teaser: {
      label: 'DINCOLO DE FOTOGRAFII',
      heading: 'Nunta voastră ar trebui să se simtă ca o nuntă, nu ca o ședință foto.',
      body: 'Fotograful vă este alături în unele dintre cele mai emoționante și imprevizibile momente ale zilei. Experiența înseamnă să știe când să vă îndrume, când să se retragă și cum să se adapteze fără să adauge presiune.',
      cta: 'Descoperiți experiența',
    },
  },
};
