import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      backgroundImage: {
        "soft-oval":
          "radial-gradient(circle at top left, rgba(255, 182, 193, 0.8), rgba(255, 182, 193, 0.5) 30%, rgba(255, 182, 193, 0) 60%)",
      },
      colors: {
        blux: {
          DEFAULT: "#1388E6",
          50: "#B8DCF9",
          100: "#A5D3F8",
          200: "#7FC0F4",
          300: "#59AEF1",
          400: "#349BEE",
          500: "#1388E6",
          600: "#0F69B2",
          700: "#0A4B7E",
          800: "#062C4B",
          900: "#020D17",
          950: "#000000",
        },
        orangex: {
          DEFAULT: "#FD8C2D",
          50: "#FFF0E3",
          100: "#FFE5CF",
          200: "#FECEA6",
          300: "#FEB87E",
          400: "#FDA255",
          500: "#FD8C2D",
          600: "#F06F02",
          700: "#B85502",
          800: "#803B01",
          900: "#492201",
          950: "#2D1500",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        loading: {
          "0%": { left: "-150px" },
          "100%": { left: "100%" },
        },
        slideInTop: {
          "0%": {
            top: "-300px",
            opacity: "0",
          },
          "100%": {
            top: "0px",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 1s ease-in",
        "fade-out": "fadeOut 1s ease-out",
        loading: "loading 1.5s linear infinite",
        "slide-in-top": "slideInTop 500ms ease-in",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
