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
            ? 'Contact | Janos Hada Photography'
            : 'Contact | Janos Hada Photography'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Get in touch to check availability for your wedding or event. Based in Cluj-Napoca, available throughout Transylvania.'
            : 'Ia legătura pentru a verifica disponibilitatea pentru nunta sau evenimentul tău. Cu sediul în Cluj-Napoca, disponibil în toată Transilvania.'
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
