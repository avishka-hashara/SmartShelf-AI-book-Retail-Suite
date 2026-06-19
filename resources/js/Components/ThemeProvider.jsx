import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pos-theme';
const LEGACY_KEY = 'theme';
const ThemeContext = createContext(null);

function getPreferredTheme() {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const storedTheme = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getPreferredTheme);

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
        localStorage.setItem(LEGACY_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemThemeChange = (event) => {
            const storedTheme = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
            if (!storedTheme) {
                setTheme(event.matches ? 'dark' : 'light');
            }
        };

        const handleStorage = (event) => {
            if (event.key === STORAGE_KEY || event.key === LEGACY_KEY) {
                setTheme(getPreferredTheme());
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        window.addEventListener('storage', handleStorage);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const value = useMemo(() => ({
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}
