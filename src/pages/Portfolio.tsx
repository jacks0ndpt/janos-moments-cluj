import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PortfolioSection from '@/components/sections/PortfolioSection';
import { Button } from '@/components/ui/button';

const Portfolio = () => {
  const { language, t } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": language === 'en' 
      ? "Wedding & Event Photography Portfolio | Janos Hada"
      : "Portofoliu Fotografie Nuntă & Evenimente | Janos Hada",
    "description": language === 'en'
      ? "Documentary wedding and event photography gallery from Cluj-Napoca. Real emotions, natural moments, honest storytelling."
      : "Galerie fotografie documentară de nuntă și evenimente din Cluj-Napoca. Emoții reale, momente naturale, povești autentice.",
    "url": "https://janoshada.com/portfolio",
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
            ? 'Wedding Photography Portfolio | Cluj-Napoca | Janos Hada'
            : 'Portofoliu Fotograf Nuntă | Cluj-Napoca | Janos Hada'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Documentary wedding and event photography from Cluj-Napoca. Real emotions, natural moments, honest storytelling. View our full portfolio.'
            : 'Fotografie documentară de nuntă și evenimente din Cluj-Napoca. Emoții reale, stil documentar, povești autentice. Vezi portofoliul complet.'
          }
        />
        <link rel="canonical" href="https://janoshada.com/portfolio" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://janoshada.com/portfolio" />
        <meta 
          property="og:title" 
          content={language === 'en'
            ? 'Wedding Photography Portfolio | Janos Hada Cluj-Napoca'
            : 'Portofoliu Fotograf Nuntă | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          property="og:description" 
          content={language === 'en'
            ? 'Documentary wedding and event photography capturing real emotions in Cluj-Napoca and Transylvania.'
            : 'Fotografie documentară de nuntă și evenimente, emoții reale în Cluj-Napoca și Transilvania.'
          }
        />
        <meta property="og:image" content="https://janoshada.com/portfolio/portfolio-1.jpg" />
        <meta property="og:image:alt" content="Wedding photography by Janos Hada in Cluj-Napoca" />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'ro_RO'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={language === 'en'
            ? 'Wedding Photography Portfolio | Janos Hada Cluj-Napoca'
            : 'Portofoliu Fotograf Nuntă | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          name="twitter:description" 
          content={language === 'en'
            ? 'Documentary wedding photography capturing real emotions in Cluj-Napoca.'
            : 'Fotografie documentară de nuntă, emoții reale în Cluj-Napoca.'
          }
        />
        <meta name="twitter:image" content="https://janoshada.com/portfolio/portfolio-1.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Header />
      
      <main className="pt-24 min-h-screen">
        {/* SEO Intro Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container-wide text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              {t('portfolio.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed mb-8">
              {t('portfolio.intro')}
            </p>
            
            {/* Category Links for SEO */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <Link to="/portfolio/weddings">{t('portfolio.filter.weddings')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/portfolio/events">{t('portfolio.filter.events')}</Link>
              </Button>
            </div>
          </div>
        </section>

        <PortfolioSection showFilters={true} />
      </main>

      <Footer />
    </>
  );
};

export default Portfolio;
