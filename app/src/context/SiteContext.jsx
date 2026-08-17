import { createContext, useContext, useState } from 'react';

const SiteContext = createContext();

export function SiteProvider({ children }) {
  // Global State for the entire OS
  const [globalProtectionGap, setGlobalProtectionGap] = useState(17500000); // default ₹1.75 Cr

  return (
    <SiteContext.Provider value={{
      globalProtectionGap,
      setGlobalProtectionGap,
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteContext() {
  return useContext(SiteContext);
}
