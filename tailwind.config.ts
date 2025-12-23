import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-purple': '#9D4EDD',
        'cyber-purple-light': '#C77DFF',
        'cyber-pink': '#FF006E',
        'cyber-cyan': '#00F5FF',
        'cyber-dark': '#0A0A0F',
        'cyber-darker': '#1A1A2E',
      },
    },
  },
  plugins: [],
};
export default config;