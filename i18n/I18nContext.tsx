import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from './translations';

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (path: string) => {
    const result = path.split('.').reduce((obj, key) => obj?.[key], translations[language]);
    if (result && typeof result === 'string') {
      return result;
    }
    return '';
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
