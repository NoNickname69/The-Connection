/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0B10",
          panel: "#14161F",
          raised: "#1C1F2B",
          line: "#282C3A",
        },
        paper: "#F2EFE9",
        muted: "#9A9CAE",
        amber: {
          DEFAULT: "#E8A33D",
          bright: "#F5C067",
          dim: "#6B4E22",
        },
        circuit: {
          DEFAULT: "#4FD1C5",
          dim: "#245852",
        },
        alert: {
          DEFAULT: "#E85D5D",
          dim: "#5A2A2A",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(232, 163, 61, 0.35)",
        "glow-circuit": "0 0 40px -10px rgba(79, 209, 197, 0.35)",
      },
      keyframes: {
        "spark-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-line": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "spark-in": "spark-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-line": "pulse-line 2.4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
