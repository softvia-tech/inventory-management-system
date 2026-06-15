import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primaryColor: '#3b82f6',
    systemTitle: 'IMS Pro',
    systemLogo: null
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('system_theme');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      setTheme(parsed);
      updateRootColor(parsed.primaryColor);
    } else {
      updateRootColor(theme.primaryColor);
    }
  }, []);

  const updateRootColor = (color) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-hover', color); // For MVP, same color or use library to darken
  };

  const updateTheme = (newTheme) => {
    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    localStorage.setItem('system_theme', JSON.stringify(updatedTheme));
    updateRootColor(updatedTheme.primaryColor);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
