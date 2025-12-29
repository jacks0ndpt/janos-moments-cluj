import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/sections/AboutSection';
import PortfolioSection from '@/components/sections/PortfolioSection';

const About = () => {
  const { language, t } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Janos Hada",
    "jobTitle": language === 'en' ? "Wedding Photographer" : "Fotograf de Nuntă",
    "description": language === 'en'
      ? "Documentary wedding photographer based in Cluj-Napoca, specializing in authentic moments and natural light photography."
      : "Fotograf documentar de nuntă din Cluj-Napoca, specializat în momente autentice și fotografie cu lumină naturală.",
    "url": "https://janoshada.com/about",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cluj-Napoca",
      "addressCountry": "RO"
    },
    "areaServed": ["Cluj-Napoca", "Transylvania", "Romania"]
  };

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'About Janos Hada | Wedding Photographer Cluj-Napoca'
            : 'Despre Janos Hada | Fotograf Nuntă Cluj-Napoca'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Janos Hada is a documentary wedding photographer in Cluj-Napoca. Focused on real moments, natural light, and authentic storytelling.'
            : 'Janos Hada, fotograf documentar de nuntă din Cluj-Napoca. Specializat în momente reale, lumină naturală și povești autentice.'
          }
        />
        <link rel="canonical" href="https://janoshada.com/about" />
        
        {/* Open Graph */}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://janoshada.com/about" />
        <meta 
          property="og:title" 
          content={language === 'en'
            ? 'About Janos Hada | Wedding Photographer Cluj-Napoca'
            : 'Despre Janos Hada | Fotograf Nuntă Cluj-Napoca'
          }
        />
        <meta 
          property="og:description" 
          content={language === 'en'
            ? 'Documentary wedding photographer in Cluj-Napoca focused on real moments and natural light.'
            : 'Fotograf documentar de nuntă din Cluj-Napoca, specializat în momente reale și lumină naturală.'
          }
        />
        <meta property="og:image" content="https://janoshada.com/portfolio/portfolio-1.jpg" />
        <meta property="og:image:alt" content="Janos Hada - Wedding Photographer in Cluj-Napoca" />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'ro_RO'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={language === 'en'
            ? 'About Janos Hada | Wedding Photographer Cluj-Napoca'
            : 'Despre Janos Hada | Fotograf Nuntă Cluj-Napoca'
          }
        />
        <meta 
          name="twitter:description" 
          content={language === 'en'
            ? 'Documentary wedding photographer focused on real moments in Cluj-Napoca.'
            : 'Fotograf documentar de nuntă, momente reale în Cluj-Napoca.'
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
              {t('about.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('about.intro')}
            </p>
          </div>
        </section>
        
        <AboutSection isFullPage={true} />
        <PortfolioSection showFilters={false} limit={3} />
      </main>

      <Footer />
    </>
  );
};

export default About;
