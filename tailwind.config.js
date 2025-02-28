/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
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
        terra: {
          50: "#fdf4f1",
          100: "#f9e4dd",
          200: "#f5c7bb",
          300: "#eda08e",
          400: "#e57a61",
          500: "#db5a3d",
          600: "#cb4528",
          700: "#a93720",
          800: "#8a301f",
          900: "#722c1f",
        },
        sand: {
          50: "#f9f7f4",
          100: "#f2ede6",
          200: "#e5d9cc",
          300: "#d3bfac",
          400: "#bea088",
          500: "#ac866d",
          600: "#9b7460",
          700: "#815e4f",
          800: "#6b4e44",
          900: "#5a423a",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e5ebe5",
          200: "#ccd7cc",
          300: "#acbdac",
          400: "#889e88",
          500: "#6d846d",
          600: "#5f745f",
          700: "#4f5f4f",
          800: "#424f42",
          900: "#384238",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "grid-sand-900":
          "linear-gradient(to right, rgb(90 66 58 / 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgb(90 66 58 / 0.1) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

