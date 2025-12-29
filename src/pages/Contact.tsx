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
    "name": language === 'en' ? "Contact Janos Hada Photography" : "Contact Janos Hada Photography",
    "description": language === 'en'
      ? "Get in touch to check availability for your wedding or event in Cluj-Napoca."
      : "Contactează-mă pentru a verifica disponibilitatea pentru nunta sau evenimentul tău.",
    "url": "https://janoshada.com/contact",
    "mainEntity": {
      "@type": "Person",
      "name": "Janos Hada",
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
            ? 'Contact Wedding Photographer | Cluj-Napoca | Janos Hada'
            : 'Contact Fotograf Nuntă | Cluj-Napoca | Janos Hada'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Contact Janos Hada to check availability for your wedding in Cluj-Napoca. Documentary photography, limited dates each year.'
            : 'Contactează-mă pentru a verifica disponibilitatea pentru nunta ta în Cluj-Napoca. Fotografie documentară, date limitate.'
          }
        />
        <link rel="canonical" href="https://janoshada.com/contact" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://janoshada.com/contact" />
        <meta 
          property="og:title" 
          content={language === 'en'
            ? 'Contact Wedding Photographer | Janos Hada Cluj-Napoca'
            : 'Contact Fotograf Nuntă | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          property="og:description" 
          content={language === 'en'
            ? 'Get in touch to check availability for your wedding in Cluj-Napoca. Limited dates available.'
            : 'Contactează-mă pentru a verifica disponibilitatea pentru nunta ta în Cluj-Napoca.'
          }
        />
        <meta property="og:image" content="https://janoshada.com/portfolio/portfolio-1.jpg" />
        <meta property="og:image:alt" content="Contact Janos Hada - Wedding Photographer Cluj-Napoca" />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'ro_RO'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={language === 'en'
            ? 'Contact Wedding Photographer | Janos Hada Cluj-Napoca'
            : 'Contact Fotograf Nuntă | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          name="twitter:description" 
          content={language === 'en'
            ? 'Get in touch to book your wedding photography in Cluj-Napoca.'
            : 'Contactează-mă pentru fotografie de nuntă în Cluj-Napoca.'
          }
        />
        <meta name="twitter:image" content="https://janoshada.com/portfolio/portfolio-1.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Header />
      
      <main className="min-h-screen">
        {/* SEO H1 Section */}
        <section className="pt-28 pb-8 bg-background">
          <div className="container-wide text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('contact.intro')}
            </p>
          </div>
        </section>
        
        <ContactForm isFullPage={true} />
        <FAQSection />
      </main>

      <Footer />
    </>
  );
};

export default Contact;
