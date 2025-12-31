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
    'portfolio.cta': 'View full wedding stories',
    'portfolio.filter.all': 'All',
    'portfolio.filter.weddings': 'Weddings',
    'portfolio.filter.events': 'Events',
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
    'portfolio.imageAlt': 'Documentary wedding photography in Cluj-Napoca capturing real moments',

    // About
    'about.title': 'About',
    'about.intro': "I’m Janos, a Cluj-based photographer with a documentary approach.",
    'about.body': "I observe and let the day unfold naturally, stepping in when it matters. The most meaningful images often appear between the planned moments.",
    'about.philosophy.title': 'How I Work',
    'about.philosophy.body': 'I stay present throughout the day, stepping in when needed, without being intrusive. I focus on laughter, tears, and small gestures that often go unnoticed, but end up meaning the most.',
    'about.cta': 'See my work',

    // Services
    'services.title': 'Services & Pricing',
    'services.intro': 'Wedding photography starts from 2,500 EUR.',
    'services.includes': 'Includes documentary coverage, editing, online gallery, delivery within 6 weeks.',
    'services.extras.title': 'Optional Extras',
    'services.extras.second': 'Second shooter',
    'services.extras.hours': 'Extra hours',
    'services.extras.engagement': 'Engagement session',
    'services.extras.album': 'Printed albums',
    'services.cta': 'Request full pricing',
    'services.availability': 'Limited availability: 5-8 weddings per year',

    // Testimonials
    'testimonials.title': 'Kind Words',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'Do you pose couples?',
    'faq.a1': 'Only when needed. Most guidance is natural and unobtrusive — I help you feel comfortable, not perform.',
    'faq.q2': 'Do you use flash?',
    'faq.a2': 'I prefer natural light unless flash is absolutely necessary. It keeps the atmosphere authentic.',
    'faq.q3': 'How long until we receive photos?',
    'faq.a3': 'Usually within 6 weeks. You\'ll receive a curated online gallery with download access.',
    'faq.q4': 'Do you travel for weddings?',
    'faq.a4': 'Yes, I photograph weddings throughout Transylvania and beyond. Travel fees may apply for distant locations.',
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
    'portfolio.cta': 'Vezi povești complete',
    'portfolio.filter.all': 'Toate',
    'portfolio.filter.weddings': 'Nunți',
    'portfolio.filter.events': 'Evenimente',
    'portfolio.filter.couples': 'Cupluri',
    'portfolio.imageAlt': 'Fotografie documentară de nuntă în Cluj-Napoca, momente reale',
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
    'services.intro': 'Fotografiere nuntă de la 2.500 EUR.',
    'services.includes': 'Include acoperire documentară, editare, galerie online, livrare în 6 săptămâni.',
    'services.extras.title': 'Opțional',
    'services.extras.second': 'Al doilea fotograf',
    'services.extras.hours': 'Ore suplimentare',
    'services.extras.engagement': 'Ședință de logodnă',
    'services.extras.album': 'Albume tipărite',
    'services.cta': 'Solicită oferta completă',
    'services.availability': 'Disponibilitate limitată: 5-8 nunți pe an',

    // Testimonials
    'testimonials.title': 'Testimoniale',

    // FAQ
    'faq.title': 'Întrebări frecvente',
    'faq.q1': 'Poziționezi mirii?',
    'faq.a1': 'Doar când e necesar. În rest, fotografiez natural — vă ajut să vă simțiți confortabil, nu să pozați.',
    'faq.q2': 'Folosești blitz?',
    'faq.a2': 'Prefer lumina naturală, blitzul doar dacă situația o cere. Păstrează atmosfera autentică.',
    'faq.q3': 'Cât durează predarea fotografiilor?',
    'faq.a3': 'De obicei în 6 săptămâni. Veți primi o galerie online curată cu acces la descărcare.',
    'faq.q4': 'Călătorești pentru nunți?',
    'faq.a4': 'Da, fotografiez nunți în toată Transilvania și nu numai. Pentru locații îndepărtate se pot aplica taxe de deplasare.',
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
    'footer.location.based': 'Cu baza în Cluj-Napoca.',
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
