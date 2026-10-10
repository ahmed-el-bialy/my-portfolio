import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, translations } from '../data/translations';

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  isArabic: boolean;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ahmed_portfolio_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'en';
  });

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';
  const isArabic = lang === 'ar';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
      if (lang === 'ar') {
        document.documentElement.classList.add('rtl-mode');
        document.documentElement.classList.remove('ltr-mode');
      } else {
        document.documentElement.classList.add('ltr-mode');
        document.documentElement.classList.remove('rtl-mode');
      }
    }
  }, [lang, dir]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const currentTranslations = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir,
        isArabic,
        setLang,
        toggleLang,
        t: currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
