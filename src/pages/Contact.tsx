import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/sections/ContactForm';
import FAQSection from '@/components/sections/FAQSection';

const Contact = () => {
  const { language, t } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": language === 'en' ? "Contact Jimmy Hada Photography" : "Contact Jimmy Hada Photography",
    "description": language === 'en'
      ? "Get in touch to check availability for your wedding or event in Cluj-Napoca."
      : "Contactează-mă pentru a verifica disponibilitatea pentru nunta sau evenimentul tău.",
    "url": "https://jimmyhada.com/contact",
    "mainEntity": {
      "@type": "Person",
      "name": "Jimmy Hada",
      "jobTitle": "Wedding Photographer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Cluj-Napoca",
        "addressCountry": "RO"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Contact Wedding Photographer | Cluj-Napoca | Jimmy Hada'
            : 'Contact Fotograf Nuntă | Cluj-Napoca | Jimmy Hada'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Contact Jimmy Hada to check availability for your wedding in Cluj-Napoca. Documentary photography, limited dates each year.'
            : 'Contactează-mă pentru a verifica disponibilitatea pentru nunta ta în Cluj-Napoca. Fotografie documentară, date limitate.'
          }
        />
        <link rel="canonical" href="https://jimmyhada.com/contact" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jimmyhada.com/contact" />
        <meta 
          property="og:title" 
          content={language === 'en'
            ? 'Contact Wedding Photographer | Jimmy Hada Cluj-Napoca'
            : 'Contact Fotograf Nuntă | Jimmy Hada Cluj-Napoca'
          }
        />
        <meta 
          property="og:description" 
          content={language === 'en'
            ? 'Get in touch to check availability for your wedding in Cluj-Napoca. Limited dates available.'
            : 'Contactează-mă pentru a verifica disponibilitatea pentru nunta ta în Cluj-Napoca.'
          }
        />
        <meta property="og:image" content="https://jimmyhada.com/portfolio/portfolio-1.jpg" />
        <meta property="og:image:alt" content="Contact Jimmy Hada - Wedding Photographer Cluj-Napoca" />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'ro_RO'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={language === 'en'
            ? 'Contact Wedding Photographer | Jimmy Hada Cluj-Napoca'
            : 'Contact Fotograf Nuntă | Jimmy Hada Cluj-Napoca'
          }
        />
        <meta 
          name="twitter:description" 
          content={language === 'en'
            ? 'Get in touch to book your wedding photography in Cluj-Napoca.'
            : 'Contactează-mă pentru fotografie de nuntă în Cluj-Napoca.'
          }
        />
        <meta name="twitter:image" content="https://jimmyhada.com/portfolio/portfolio-1.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Header />
      
      <main className="min-h-screen">
        <ContactForm isFullPage={true} />
        <FAQSection />
      </main>

      <Footer />
    </>
  );
};

export default Contact;
