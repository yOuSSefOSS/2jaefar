import React, { createContext, useContext, useState } from 'react';

const AcademyContext = createContext();

export function AcademyProvider({ children }) {
  const [language, setLanguage] = useState('en'); // 'en' or 'ar'

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <AcademyContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </AcademyContext.Provider>
  );
}

export function useAcademy() {
  return useContext(AcademyContext);
}
