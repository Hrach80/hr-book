/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                darkBg: '#0b0f19',
                cardDark: 'rgba(255, 255, 255, 0.05)',
                cardLight: 'rgba(255, 255, 255, 0.7)',
            },
            boxShadow: {
                neoDark: '8px 8px 16px #05070c, -8px -8px 16px #111726',
                neoLight: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
            }
        },
    },
    plugins: [],
}