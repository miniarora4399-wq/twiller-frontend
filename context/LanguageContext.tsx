"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";

import { TranslationKey, translations } from "@/lib/translations";

type Language = keyof typeof translations;

type LanguageContextType = {
    language : Language;
    setLanguage:(language : Language) => void;
    t:(key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined > (
    undefined
);

export function LanguageProvider({
    children,
}:{
    children: ReactNode;
}){
    const [language, setLanguageState] = useState<Language>("en");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("language");

        if(saved && saved in translations){
            setLanguageState(saved as Language);
        }

        setLoaded(true);
    },[]);

    const setLanguage = (newLanguage : Language) => {
        localStorage.setItem("language", newLanguage);
        setLanguageState(newLanguage);
    };

    const t = (key: TranslationKey) => {
        const currentTranslations = translations[language] as Partial<
            Record<TranslationKey, string>
        >;
        const fallbackTranslations = translations.en as Partial<
            Record<TranslationKey, string>
        >;

        return currentTranslations[key] ?? fallbackTranslations[key] ?? key;
    };

    return(
        <LanguageContext.Provider value = {{language, setLanguage, t}}>
            {loaded ? children : null}
        </LanguageContext.Provider>
    );
}

export function useLanguage(){
    const context = useContext(LanguageContext);

    if(!context){
        throw new Error ("useLanguage must be used inside LanguageProvider");
    }

    return context;
}