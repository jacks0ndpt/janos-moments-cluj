import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Privacy = () => {
  const { language } = useLanguage();

  const content = language === 'en' ? {
    title: 'Privacy Policy',
    intro: 'Your privacy matters. Here\'s how I handle your data.',
    lastUpdated: 'Last updated: January 2024',
    sections: [
      {
        title: 'Information I Collect',
        content: 'When you contact me through this website, I collect your name, email address, phone number, and any details you provide about your event. This information is used solely to respond to your inquiry and discuss potential photography services.'
      },
      {
        title: 'How I Use Your Information',
        content: 'Your personal information is used to: communicate with you about your inquiry, provide photography services if we work together, send you your photos and related deliverables, and improve my services based on feedback.'
      },
      {
        title: 'Data Protection',
        content: 'I take reasonable precautions to protect your personal information. Your data is stored securely and is not shared with third parties except as necessary to provide my services (e.g., online gallery hosting).'
      },
      {
        title: 'Your Rights',
        content: 'Under GDPR, you have the right to access, correct, or delete your personal data. You can also object to processing or request data portability. To exercise these rights, please contact me at hello@janoshada.com.'
      },
      {
        title: 'Photo Usage',
        content: 'With your consent, I may use photos from your event in my portfolio, website, and social media. You can opt out of this at any time by contacting me directly.'
      },
      {
        title: 'Cookies',
        content: 'This website uses essential cookies to ensure proper functionality. No tracking or advertising cookies are used.'
      },
      {
        title: 'Contact',
        content: 'For any privacy-related questions, please contact me at hello@janoshada.com.'
      }
    ]
  } : {
    title: 'Politica de Confidențialitate',
    intro: 'Confidențialitatea ta contează. Iată cum gestionez datele tale.',
    lastUpdated: 'Ultima actualizare: Ianuarie 2024',
    sections: [
      {
        title: 'Informațiile pe care le colectez',
        content: 'Când mă contactezi prin acest site, colectez numele tău, adresa de email, numărul de telefon și orice detalii pe care le oferi despre evenimentul tău. Aceste informații sunt folosite exclusiv pentru a răspunde solicitării tale și a discuta despre potențiale servicii fotografice.'
      },
      {
        title: 'Cum folosesc informațiile tale',
        content: 'Informațiile tale personale sunt folosite pentru: a comunica cu tine despre solicitarea ta, a oferi servicii fotografice dacă lucrăm împreună, a-ți trimite fotografiile și livrabilele aferente, și a îmbunătăți serviciile mele pe baza feedback-ului.'
      },
      {
        title: 'Protecția datelor',
        content: 'Iau măsuri rezonabile pentru a proteja informațiile tale personale. Datele tale sunt stocate în siguranță și nu sunt partajate cu terți, cu excepția cazului în care este necesar pentru a oferi serviciile mele (ex: hosting galerie online).'
      },
      {
        title: 'Drepturile tale',
        content: 'Conform GDPR, ai dreptul de a accesa, corecta sau șterge datele tale personale. De asemenea, poți obiecta la procesare sau solicita portabilitatea datelor. Pentru a exercita aceste drepturi, te rog să mă contactezi la hello@janoshada.com.'
      },
      {
        title: 'Utilizarea fotografiilor',
        content: 'Cu acordul tău, pot folosi fotografii de la evenimentul tău în portofoliul meu, pe site și pe rețelele sociale. Poți renunța la aceasta în orice moment contactându-mă direct.'
      },
      {
        title: 'Cookie-uri',
        content: 'Acest site folosește cookie-uri esențiale pentru a asigura funcționarea corectă. Nu se folosesc cookie-uri de tracking sau publicitate.'
      },
      {
        title: 'Contact',
        content: 'Pentru orice întrebări legate de confidențialitate, te rog să mă contactezi la hello@janoshada.com.'
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Privacy Policy | Janos Hada Photography'
            : 'Politica de Confidențialitate | Janos Hada Photography'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Privacy policy for Janos Hada Photography. Learn how your personal data is collected, used, and protected.'
            : 'Politica de confidențialitate pentru Janos Hada Photography. Află cum sunt colectate, folosite și protejate datele tale personale.'
          }
        />
      </Helmet>

      <Header />
      
      <main className="min-h-screen pt-32 section-padding">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
              {content.title}
            </h1>
            <p className="text-muted-foreground mb-2">{content.intro}</p>
            <p className="text-sm text-muted-foreground mb-12">{content.lastUpdated}</p>

            <div className="space-y-8">
              {content.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h2 className="font-heading text-xl mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Privacy;
