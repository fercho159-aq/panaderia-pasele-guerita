/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
        "../ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#4A675D", // Verde
                accent: "#F4A7C1",  // Rosa
                bg: "#FDF5F0",      // Crema
            },
            fontFamily: {
                serif: ["Playfair Display", "serif"],
                sans: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
}
