import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 transition-colors duration-300 ${
          language === 'en'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="English"
      >
        EN
      </button>
      <span className="text-border">|</span>
      <button
        onClick={() => setLanguage('ro')}
        className={`px-2 py-1 transition-colors duration-300 ${
          language === 'ro'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Română"
      >
        RO
      </button>
    </div>
  );
};

export default LanguageToggle;
