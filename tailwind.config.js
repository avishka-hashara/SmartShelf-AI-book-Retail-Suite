import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                primary: "#1a73e8", // Blue color from the dashboard sidebar button
                "primary-dark": "#1557b0",
                "background-light": "#f4f6f8", // Light gray background from dashboard
                "background-dark": "#121212", // Dark mode background
                "surface-light": "#ffffff",
                "surface-dark": "#1e1e1e",
                "text-primary-light": "#1f2937",
                "text-primary-dark": "#e5e7eb",
                "text-secondary-light": "#6b7280",
                "text-secondary-dark": "#9ca3af",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif", ...defaultTheme.fontFamily.sans],
                display: ["Plus Jakarta Sans", "Inter", ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
