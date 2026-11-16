import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Language, Translations, translations } from '../data/translations';

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  isArabic: boolean;
  isSwitchingLang: boolean;
  switchingTargetLang: Language | null;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ahmed_portfolio_lang_v3';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'en';
  });

  const [isSwitchingLang, setIsSwitchingLang] = useState(false);
  const [switchingTargetLang, setSwitchingTargetLang] = useState<Language | null>(null);
  const swapTimerRef = useRef<number | null>(null);
  const endTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
      if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
    };
  }, []);

  const triggerLanguageTransition = (nextLang: Language) => {
    if (nextLang === lang) return;

    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    if (endTimerRef.current) window.clearTimeout(endTimerRef.current);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setLangState(nextLang);
      return;
    }

    setSwitchingTargetLang(nextLang);
    setIsSwitchingLang(true);

    // Swap RTL/LTR and strings smoothly behind the self-drawing Leaf curtain
    swapTimerRef.current = window.setTimeout(() => {
      setLangState(nextLang);
      swapTimerRef.current = null;
    }, 520);

    // Hold full Leaf draw cadence before revealing swapped UI cleanly
    endTimerRef.current = window.setTimeout(() => {
      setIsSwitchingLang(false);
      setSwitchingTargetLang(null);
      endTimerRef.current = null;
    }, 1450);
  };

  const setLang = (newLang: Language) => {
    triggerLanguageTransition(newLang);
  };

  const toggleLang = () => {
    const next: Language = lang === 'en' ? 'ar' : 'en';
    triggerLanguageTransition(next);
  };

  const currentTranslations = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir,
        isArabic,
        isSwitchingLang,
        switchingTargetLang,
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
