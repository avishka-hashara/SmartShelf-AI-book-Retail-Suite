import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/Components/ThemeProvider';

export default function ThemeToggle({ className = '', compact = false }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={[
                'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white',
                compact ? 'h-10 w-10' : 'h-11 px-4',
                className,
            ].join(' ')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!compact && <span className="text-sm font-medium">{isDark ? 'Light' : 'Dark'} mode</span>}
        </button>
    );
}
