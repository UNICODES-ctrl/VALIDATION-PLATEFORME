import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "hsl(231 75% 52%)",
          foreground: "hsl(0 0% 100%)",
        },
      },
    },
  },
  plugins: [],
}

export default config