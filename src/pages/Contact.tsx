import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/sections/ContactForm';
import FAQSection from '@/components/sections/FAQSection';

const Contact = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Contact Wedding Photographer | Cluj-Napoca'
            : 'Contact Fotograf Nuntă | Cluj-Napoca'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Get in touch to check availability for your wedding or event in Cluj-Napoca. Limited dates available each year.'
            : 'Contactează-mă pentru a verifica disponibilitatea pentru nunta sau evenimentul tău în Cluj-Napoca.'
          }
        />
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
