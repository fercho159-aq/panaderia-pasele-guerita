/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/web/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"
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
