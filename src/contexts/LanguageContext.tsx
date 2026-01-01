import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ro';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.portfolio': 'Portfolio',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.availability': 'Check Availability',

    // Hero
    'hero.title': 'Wedding & Event Photography in Cluj-Napoca',
    'hero.subtitle': 'Real moments. Honest emotions. Photographed as they happen.',
    'hero.body': 'I focus on documentary-style weddings and events. Natural light whenever possible, minimal direction, no forced poses. Your day as it actually felt.',
    'hero.cta.primary': 'Check availability',
    'hero.cta.secondary': 'View portfolio',

    // Portfolio
    'portfolio.title': 'Portfolio',
    'portfolio.intro': 'A selection of weddings and events captured in a documentary, unobtrusive style. Focus on people, moments and emotion.',
    'portfolio.cta': 'View Gallery',
    'portfolio.filter.all': 'All',
    'portfolio.filter.weddings': 'Weddings',
    'portfolio.filter.events': 'Baptisms',
    'portfolio.filter.couples': 'Couples',
    'portfolio.noImages': 'No images available in this category yet.',
    
    // Portfolio Weddings
    'portfolio.weddings.title': 'Wedding Photography',
    'portfolio.weddings.intro': 'Documentary wedding photography that captures the real emotions and authentic moments of your special day. Natural light, honest storytelling, no forced poses.',
    'portfolio.weddings.cta.title': 'Planning Your Wedding?',
    'portfolio.weddings.cta.body': 'I capture weddings throughout Cluj-Napoca and Transylvania. Let\'s discuss your vision and check availability.',
    
    // Portfolio Events
    'portfolio.events.title': 'Event Photography',
    'portfolio.events.intro': 'From corporate gatherings to private celebrations, I document events with the same unobtrusive, documentary approach. Real moments, authentic atmosphere.',
    'portfolio.events.cta.title': 'Have an Event Coming Up?',
    'portfolio.events.cta.body': 'Whether corporate or private, I bring the same documentary approach to every event. Get in touch to discuss your needs.',
    'portfolio.imageAlt': 'Wedding photography in Cluj-Napoca',
    'portfolio.backToTop': 'Back to top',

    // About
    'about.title': 'About',
    'about.intro': "I’m Janos, a Cluj-based photographer with a documentary approach.",
    'about.body': "I observe and let the day unfold naturally, stepping in when it matters. The most meaningful images often appear between the planned moments.",
    'about.philosophy.title': 'How I Work',
    'about.philosophy.body': 'I stay present throughout the day, stepping in when needed, without being intrusive. I focus on laughter, tears, and small gestures that often go unnoticed, but end up meaning the most.',
    'about.cta': 'See my work',

    // Services
    'services.title': 'Services & Pricing',
    'services.intro': 'Wedding photography from 700 EUR (full-day coverage)',
    'services.includes': 'Full-day, natural coverage, carefully edited images, a private online gallery, delivered within 4 weeks.',
    'services.extras.title': 'Optional add-ons (and more, on request)',
    'services.extras.second': 'Videography',
    'services.extras.hours': 'Second shooter',
    'services.extras.engagement': 'Engagement session',
    'services.extras.album': 'Trash the dress session',
    'services.cta': 'Check availability + get pricing',
    'services.availability': 'Limited availability: 5-8 weddings per year',

    // Testimonials
    'testimonials.title': 'Kind Words',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'What is your photography style?',
    'faq.a1': 'Natural, story-driven photography focused on real moments, light, and atmosphere. I document the day as it unfolds, without forcing it.',
    'faq.q2': 'Do you pose couples?',
    'faq.a2': 'I guide when needed, especially during portraits, but most of the day is captured naturally. My goal is to help you feel comfortable, not to perform for the camera.',
    'faq.q3': 'How long until we receive the photos?',
    'faq.a3': 'You’ll receive a carefully curated online gallery within up to 4 weeks, often sooner depending on the season.',
    'faq.q4': 'How do we book you?',
    'faq.a4': 'Simply reach out through the contact form to check availability.',
    'faq.cta': 'Check availability',

    // Contact
    'contact.title': 'Get in Touch',
    'contact.intro': 'Ready to tell your story? Let\'s start a conversation.',
    'contact.imageAlt': 'Documentary wedding photography moment in Cluj-Napoca',
    'contact.form.name': 'Your name',
    'contact.form.email': 'Email address',
    'contact.form.phone': 'Phone number',
    'contact.form.eventType': 'Event type',
    'contact.form.eventType.wedding': 'Wedding',
    'contact.form.eventType.event': 'Event',
    'contact.form.eventType.couples': 'Couples session',
    'contact.form.date': 'Event date',
    'contact.form.location': 'Location',
    'contact.form.hours': 'Estimated hours',
    'contact.form.message': 'Tell me about your day',
    'contact.form.submit': 'Check availability',
    'contact.success': 'Thank you! I\'ll get back to you within 48 hours.',

    // Footer
    'footer.tagline': 'Documentary wedding photography in Cluj-Napoca & Transylvania',
    'footer.copyright': '© 2024 Janos Hada Photography. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.instagram': 'Instagram',
    'footer.email': 'Email',
    'footer.location.based': 'Based in Cluj-Napoca.',
    'footer.location.available': 'Available for weddings and events across Transylvania and Romania.',

    // Privacy
    'privacy.title': 'Privacy Policy',
    'privacy.intro': 'Your privacy matters. Here\'s how I handle your data.',
  },
  ro: {
    // Navigation
    'nav.home': 'Acasă',
    'nav.portfolio': 'Portofoliu',
    'nav.about': 'Despre',
    'nav.services': 'Servicii',
    'nav.contact': 'Contact',
    'nav.availability': 'Verifică disponibilitatea',

    // Hero
    'hero.title': 'Fotografie de nuntă & evenimente în Cluj-Napoca',
    'hero.subtitle': 'Momente reale. Emoții autentice. Fotografiate așa cum se întâmplă.',
    'hero.body': 'O abordare documentară, cu lumină naturală și intervenții minime. Ziua voastră, așa cum s-a simțit.',
    'hero.cta.primary': 'Verifică disponibilitatea',
    'hero.cta.secondary': 'Vezi portofoliul',

    // Portfolio
    'portfolio.title': 'Portofoliu',
    'portfolio.intro': 'O selecție de nunți și evenimente surprinse documentar, discret. Accent pe oameni, emoții și atmosferă.',
    'portfolio.cta': 'Vezi galeria',
    'portfolio.filter.all': 'Toate',
    'portfolio.filter.weddings': 'Nunți',
    'portfolio.filter.events': 'Botezuri',
    'portfolio.filter.couples': 'Cupluri',
    'portfolio.imageAlt': 'Fotografie de nuntă în Cluj-Napoca',
    'portfolio.backToTop': 'La început',
    'portfolio.noImages': 'Nu există imagini disponibile în această categorie momentan.',
    
    // Portfolio Weddings
    'portfolio.weddings.title': 'Fotografie de Nuntă',
    'portfolio.weddings.intro': 'Fotografie documentară de nuntă care surprinde emoțiile reale și momentele autentice ale zilei tale speciale. Lumină naturală, povești oneste, fără poze forțate.',
    'portfolio.weddings.cta.title': 'Îți Planifici Nunta?',
    'portfolio.weddings.cta.body': 'Fotografiez nunți în Cluj-Napoca și în toată Transilvania. Hai să discutăm viziunea ta și să verificăm disponibilitatea.',
    
    // Portfolio Events
    'portfolio.events.title': 'Fotografie Evenimente',
    'portfolio.events.intro': 'De la evenimente corporate la celebrări private, documentez fiecare eveniment cu aceeași abordare discretă, documentară. Momente reale, atmosferă autentică.',
    'portfolio.events.cta.title': 'Ai un Eveniment în Curând?',
    'portfolio.events.cta.body': 'Corporate sau privat, aduc aceeași abordare documentară la fiecare eveniment. Contactează-mă să discutăm.',

    // About
    'about.title': 'Despre mine',
    'about.intro': 'Urmăresc momente autentice și evoluția naturală a unei zile. Sunt Janos, fotograf din Cluj-Napoca.',
    'about.body': 'Observ și las ziua să se desfășoare natural. Cele mai puternice imagini apar, de multe ori, între momentele planificate.',
    'about.philosophy.title': 'Abordarea mea',
    'about.philosophy.body': 'Sunt prezent pe tot parcursul zilei și mă adaptez fiecărui moment, cu discreție. Mă concentrez pe râsete, emoții și gesturi mici care trec adesea neobservate, dar ajung să conteze cel mai mult.',
    'about.cta': 'Vezi portofoliul',

    // Services
    'services.title': 'Servicii & Prețuri',
    'services.intro': 'Fotografie de nuntă începând cu 700 EUR (ziua întreagă inclusă)',
    'services.includes': 'Fotografiere pe tot parcursul zilei, imagini editate atent, o galerie online privată, livrate în maximum 4 săptămâni.',
    'services.extras.title': 'Opțiuni suplimentare (și altele, la cerere)',
    'services.extras.second': 'Videografie',
    'services.extras.hours': 'Al doilea fotograf',
    'services.extras.engagement': 'Ședință de logodnă',
    'services.extras.album': 'Ședință Trash the Dress',
    'services.cta': 'Verifică disponibilitatea si solicită o oferta',
    'services.availability': 'Disponibilitate limitată: 5-8 nunți pe an',

    // Testimonials
    'testimonials.title': 'Testimoniale',

    // FAQ
    'faq.title': 'Întrebări frecvente',
    'faq.q1': 'Care este stilul tău de fotografie?',
    'faq.a1': 'Un stil natural, axat pe poveste, momente reale, lumină și atmosferă. Surprind ziua așa cum se întâmplă, fără cadre forțate.',
    'faq.q2': 'Pozezi cuplurile?',
    'faq.a2': 'Ofer ghidaj atunci când este nevoie, mai ales la portrete, dar în cea mai mare parte fotografiez natural. Important pentru mine este să vă simțiți confortabil, si sa va bucurati de eveniment.',
    'faq.q3': 'În cât timp primim fotografiile?',
    'faq.a3': 'Veți primi o galerie online atent selecționată în maximum 4 săptămâni, de multe ori chiar mai repede, în funcție de perioadă.',
    'faq.q4': 'Cum te putem rezerva?',
    'faq.a4': 'Ne puteți scrie prin formularul de contact pentru a verifica disponibilitatea. Data este confirmată după semnarea contractului și achitarea avansului.',
    'faq.cta': 'Verifică disponibilitatea',

    // Contact
    'contact.title': 'Contact',
    'contact.intro': 'Gata să-ți spui povestea? Hai să începem o conversație.',
    'contact.imageAlt': 'Moment de fotografie documentară de nuntă în Cluj-Napoca',
    'contact.form.name': 'Numele tău',
    'contact.form.email': 'Adresa de email',
    'contact.form.phone': 'Număr de telefon',
    'contact.form.eventType': 'Tipul evenimentului',
    'contact.form.eventType.wedding': 'Nuntă',
    'contact.form.eventType.event': 'Eveniment',
    'contact.form.eventType.couples': 'Ședință foto cuplu',
    'contact.form.date': 'Data evenimentului',
    'contact.form.location': 'Locație',
    'contact.form.hours': 'Ore estimate',
    'contact.form.message': 'Spune-mi despre ziua ta',
    'contact.form.submit': 'Verifică disponibilitatea',
    'contact.success': 'Mulțumesc! Voi răspunde în maximum 48 de ore.',

    // Footer
    'footer.tagline': 'Fotografie documentară de nuntă în Cluj-Napoca & Transilvania',
    'footer.copyright': '© 2024 Janos Hada Photography. Toate drepturile rezervate.',
    'footer.privacy': 'Politica de confidențialitate',
    'footer.instagram': 'Instagram',
    'footer.email': 'Email',
    'footer.location.based': 'Cluj-Napoca.',
    'footer.location.available': 'Disponibil pentru nunți și evenimente în Transilvania și în toată România.',

    // Privacy
    'privacy.title': 'Politica de confidențialitate',
    'privacy.intro': 'Confidențialitatea ta contează. Iată cum gestionez datele tale.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved) return saved;
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ro')) return 'ro';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
