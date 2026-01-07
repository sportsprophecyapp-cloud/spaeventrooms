'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

type Language = 'en' | 'id' | 'th';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // 1. Check for saved preference
        const savedLang = localStorage.getItem('user_lang') as Language;
        if (savedLang && ['en', 'id', 'th'].includes(savedLang)) {
            setLanguageState(savedLang);
            return;
        }

        // 2. Fallback to browser detection
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'id') setLanguageState('id');
        else if (browserLang === 'th') setLanguageState('th');
        else setLanguageState('en');
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('user_lang', lang);
    };

    const t = (key: string): string => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
