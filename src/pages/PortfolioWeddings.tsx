import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PortfolioCategorySection from '@/components/sections/PortfolioCategorySection';
import BackToTopButton from '@/components/BackToTopButton';
import { Button } from '@/components/ui/button';

const PortfolioWeddings = () => {
  const { language, t } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": language === 'en' 
      ? "Wedding Photography Gallery | Janos Hada"
      : "Galerie Fotografie Nuntă | Janos Hada",
    "description": language === 'en'
      ? "Documentary wedding photography from Cluj-Napoca capturing real emotions and authentic moments."
      : "Fotografie documentară de nuntă din Cluj-Napoca, surprinzând emoții reale și momente autentice.",
    "url": "https://janoshada.com/portfolio/weddings",
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
            ? 'Wedding Photography Gallery | Cluj-Napoca | Janos Hada'
            : 'Galerie Fotografie Nuntă | Cluj-Napoca | Janos Hada'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Documentary wedding photography in Cluj-Napoca. Authentic moments, natural light, real emotions. View wedding stories from Transylvania.'
            : 'Fotografie documentară de nuntă în Cluj-Napoca. Momente autentice, lumină naturală, emoții reale. Vezi povești de nuntă din Transilvania.'
          }
        />
        <link rel="canonical" href="https://janoshada.com/portfolio/weddings" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://janoshada.com/portfolio/weddings" />
        <meta 
          property="og:title" 
          content={language === 'en'
            ? 'Wedding Photography Gallery | Janos Hada Cluj-Napoca'
            : 'Galerie Fotografie Nuntă | Janos Hada Cluj-Napoca'
          }
        />
        <meta 
          property="og:description" 
          content={language === 'en'
            ? 'Documentary wedding photography capturing real emotions and authentic moments in Cluj-Napoca.'
            : 'Fotografie documentară de nuntă, surprinzând emoții reale și momente autentice în Cluj-Napoca.'
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
            ? 'Wedding Photography Gallery | Janos Hada Cluj-Napoca'
            : 'Galerie Fotografie Nuntă | Janos Hada Cluj-Napoca'
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
        <section className="section-padding bg-background">
          <div className="container-wide text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              {t('portfolio.weddings.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              {t('portfolio.weddings.intro')}
            </p>
          </div>
        </section>

        <PortfolioCategorySection category="weddings" />
        
        {/* CTA Section */}
        <section className="section-padding bg-secondary/30">
          <div className="container-wide text-center">
            <h2 className="font-heading text-2xl md:text-3xl mb-4">
              {t('portfolio.weddings.cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('portfolio.weddings.cta.body')}
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

export default PortfolioWeddings;
