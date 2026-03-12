/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
        "../ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#486D62", // Verde Botánico
                accent: "#F4A7C1",  // Rosa
                bg: "#FFEFEA",      // Crema
            },
            fontFamily: {
                serif: ["'Frunchy Sage'", "serif"],
                sans: ["'Lumberjack'", "sans-serif"],
            },
        },
    },
    plugins: [],
}
