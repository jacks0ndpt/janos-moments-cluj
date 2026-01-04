import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PortfolioCategorySection from '@/components/sections/PortfolioCategorySection';
import BackToTopButton from '@/components/BackToTopButton';
import { Button } from '@/components/ui/button';

const PortfolioEvents = () => {
  const { language, t } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": language === 'en' 
      ? "Event Photography Gallery | Janos Hada"
      : "Galerie Fotografie Evenimente | Janos Hada",
    "description": language === 'en'
      ? "Documentary event photography from Cluj-Napoca capturing authentic moments and real emotions."
      : "Fotografie documentară de evenimente din Cluj-Napoca, surprinzând momente autentice și emoții reale.",
    "url": "https://janoshada.com/portfolio/events",
    "author": {
      "@type": "Person",
      "name": "Janos Hada"
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Event Photography Gallery | Cluj-Napoca | Janos Hada'
            : 'Galerie Fotografie Evenimente | Cluj-Napoca | Janos Hada'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Documentary event photography in Cluj-Napoca. Corporate events, celebrations, and special moments captured with natural light.'
            : 'Fotografie documentară de evenimente în Cluj-Napoca. Evenimente corporate, celebrări și momente speciale în lumină naturală.'
          }
        />
        <link rel="canonical" href="https://janoshada.com/portfolio/events" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://janoshada.com/portfolio/events" />
        <meta 
          property="og:title" 
          content={language === 'en'
            ? 'Event Photography Gallery | Janos Hada Cluj-Napoca'
            : 'Galerie Fotografie Evenimente | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          property="og:description" 
          content={language === 'en'
            ? 'Documentary event photography capturing authentic moments in Cluj-Napoca and Transylvania.'
            : 'Fotografie documentară de evenimente, momente autentice în Cluj-Napoca și Transilvania.'
          }
        />
        <meta property="og:image" content="https://janoshada.com/portfolio/portfolio-event.jpg" />
        <meta property="og:image:alt" content="Event photography by Janos Hada in Cluj-Napoca" />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'ro_RO'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={language === 'en'
            ? 'Event Photography Gallery | Janos Hada Cluj-Napoca'
            : 'Galerie Fotografie Evenimente | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          name="twitter:description" 
          content={language === 'en'
            ? 'Documentary event photography capturing authentic moments in Cluj-Napoca.'
            : 'Fotografie documentară de evenimente, momente autentice în Cluj-Napoca.'
          }
        />
        <meta name="twitter:image" content="https://janoshada.com/portfolio/portfolio-event.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Header />
      
      <main className="pt-24 min-h-screen">
        {/* SEO Intro Section */}
        <section className="section-padding bg-background">
          <div className="container-wide text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              {t('portfolio.events.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              {t('portfolio.events.intro')}
            </p>
          </div>
        </section>

        <PortfolioCategorySection category="events" />
        
        {/* CTA Section */}
        <section className="section-padding bg-secondary/30">
          <div className="container-wide text-center">
            <h2 className="font-heading text-2xl md:text-3xl mb-4">
              {t('portfolio.events.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('portfolio.events.cta.body')}
            </p>
            <Button asChild size="lg">
              <Link to="/contact">{t('contact.form.submit')}</Link>
            </Button>
          </div>
        </section>
      </main>

      <BackToTopButton />
      <Footer />
    </>
  );
};

export default PortfolioEvents;
