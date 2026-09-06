"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AppContextType {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // The palette lives in CSS variables keyed off this class (see globals.css),
  // so pages read their colors from CSS rather than from this context. That is
  // what lets pages stay Server Components.
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <AppContext.Provider value={{ menuOpen, setMenuOpen, dark, setDark }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
