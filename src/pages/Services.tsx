import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/sections/ServicesSection';
import FAQSection from '@/components/sections/FAQSection';
import ContactForm from '@/components/sections/ContactForm';

const Services = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Services & Pricing | Janos Hada Photography'
            : 'Servicii & Prețuri | Janos Hada Photography'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Wedding photography packages starting from 2,500 EUR. Documentary coverage, professional editing, online gallery. Limited availability.'
            : 'Pachete fotografiere nuntă de la 2.500 EUR. Acoperire documentară, editare profesională, galerie online. Disponibilitate limitată.'
          }
        />
      </Helmet>

      <Header />
      
      <main className="min-h-screen">
        <ServicesSection isFullPage={true} />
        <FAQSection isFullPage={true} />
        <ContactForm />
      </main>

      <Footer />
    </>
  );
};

export default Services;
