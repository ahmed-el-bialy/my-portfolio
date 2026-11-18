import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Language, Translations, translations } from '../data/translations';
export type { Language };

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  isArabic: boolean;
  isSwitchingLang: boolean;
  switchingTargetLang: Language | null;
  completeLanguageSwitch: () => void;
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
  const fallbackEndTimerRef = useRef<number | null>(null);

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
      if (fallbackEndTimerRef.current) window.clearTimeout(fallbackEndTimerRef.current);
    };
  }, []);

  const completeLanguageSwitch = useCallback(() => {
    if (fallbackEndTimerRef.current) {
      window.clearTimeout(fallbackEndTimerRef.current);
      fallbackEndTimerRef.current = null;
    }
    setIsSwitchingLang(false);
    setSwitchingTargetLang(null);
  }, []);

  const triggerLanguageTransition = (nextLang: Language) => {
    if (nextLang === lang && !isSwitchingLang) return;
    if (isSwitchingLang && switchingTargetLang === nextLang) return;

    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    if (fallbackEndTimerRef.current) window.clearTimeout(fallbackEndTimerRef.current);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setLangState(nextLang);
      setIsSwitchingLang(false);
      setSwitchingTargetLang(null);
      return;
    }

    setSwitchingTargetLang(nextLang);
    setIsSwitchingLang(true);

    // Swap entire app language/RTL silently at ~480ms once full-viewport curtain is opaque
    swapTimerRef.current = window.setTimeout(() => {
      React.startTransition(() => {
        setLangState(nextLang);
      });
      swapTimerRef.current = null;
    }, 480);

    // Hard safety cap so curtain can never stay stuck if overlay animation callback fails
    fallbackEndTimerRef.current = window.setTimeout(() => {
      completeLanguageSwitch();
    }, 3200);
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
        completeLanguageSwitch,
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
