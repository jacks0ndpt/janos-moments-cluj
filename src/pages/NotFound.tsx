import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-heading text-8xl md:text-9xl text-primary/20 mb-4">404</h1>
          <h2 className="font-heading text-3xl md:text-4xl mb-4">
            {language === 'en' ? 'Page Not Found' : 'Pagina nu a fost găsită'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'en' 
              ? "The page you're looking for doesn't exist or has been moved."
              : 'Pagina pe care o cauți nu există sau a fost mutată.'
            }
          </p>
          <Button asChild variant="hero">
            <Link to="/">
              {language === 'en' ? 'Back to Home' : 'Înapoi la pagina principală'}
            </Link>
          </Button>
        </motion.div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
