import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/sections/ServicesSection';
import FAQSection from '@/components/sections/FAQSection';
import ContactForm from '@/components/sections/ContactForm';

const Services = () => {
  const { language, t } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": language === 'en' ? "Wedding Photography Services" : "Servicii Fotografie Nuntă",
    "description": language === 'en'
      ? "Documentary wedding photography packages in Cluj-Napoca. Transparent pricing, natural style, limited availability."
      : "Pachete de fotografiere nuntă în Cluj-Napoca. Prețuri transparente, stil natural, disponibilitate limitată.",
    "provider": {
      "@type": "Person",
      "name": "Janos Hada"
    },
    "areaServed": ["Cluj-Napoca", "Transylvania", "Romania"],
    "priceRange": "€€€"
  };

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Wedding Photography Pricing | Cluj-Napoca | Janos Hada'
            : 'Prețuri Fotograf Nuntă | Cluj-Napoca | Janos Hada'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Wedding photography packages in Cluj-Napoca starting from €2,500. Documentary coverage, natural style, limited dates. Request pricing details.'
            : 'Pachete fotografie nuntă în Cluj-Napoca de la 2.500 EUR. Stil documentar, abordare naturală. Solicită detalii prețuri.'
          }
        />
        <link rel="canonical" href="https://janoshada.com/services" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://janoshada.com/services" />
        <meta 
          property="og:title" 
          content={language === 'en'
            ? 'Wedding Photography Pricing | Janos Hada Cluj-Napoca'
            : 'Prețuri Fotograf Nuntă | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          property="og:description" 
          content={language === 'en'
            ? 'Documentary wedding photography packages in Cluj-Napoca. Transparent pricing, limited availability.'
            : 'Pachete fotografie documentară de nuntă în Cluj-Napoca. Prețuri transparente, disponibilitate limitată.'
          }
        />
        <meta property="og:image" content="https://janoshada.com/portfolio/portfolio-1.jpg" />
        <meta property="og:image:alt" content="Wedding photography services by Janos Hada" />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'ro_RO'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={language === 'en'
            ? 'Wedding Photography Pricing | Janos Hada Cluj-Napoca'
            : 'Prețuri Fotograf Nuntă | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          name="twitter:description" 
          content={language === 'en'
            ? 'Documentary wedding photography packages in Cluj-Napoca.'
            : 'Pachete fotografie documentară de nuntă în Cluj-Napoca.'
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
              {t('services.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('services.intro')}
            </p>
          </div>
        </section>
        
        <ServicesSection isFullPage={true} />
        <FAQSection isFullPage={true} />
        <ContactForm />
      </main>

      <Footer />
    </>
  );
};

export default Services;
