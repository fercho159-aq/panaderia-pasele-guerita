/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
        "../ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#366F5F", // Verde Pásele
                accent: "#F4A7C1",  // Rosa Corazón (Original)
                bg: "#FFEFEA",      // Rosa Pálido / BG
                brown: "#AF4C0F",   // Marrón Rustico
            },
            fontFamily: {
                serif: ["'Frunchy Sage'", "serif"],
                sans: ["'Lumberjack'", "sans-serif"],
            },
        },
    },
    plugins: [],
}
