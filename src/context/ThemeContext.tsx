import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'warm';

interface ThemeContextValue {
  theme:    Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:    'light',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = (localStorage.getItem('gk_theme') ?? 'light') as Theme;
  const [theme, _setTheme] = useState<Theme>(stored);

  const setTheme = useCallback((t: Theme) => {
    _setTheme(t);
    localStorage.setItem('gk_theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
