import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        background: {
          base: "var(--bg-base)",
          default: "var(--bg-default)",
        },
        surface: {
          DEFAULT: "var(--surface-default)",
          subtle: "var(--surface-subtle)",
        },
        type: {
          DEFAULT: "var(--type-default)",
          muted: "var(--type-muted)",
          disabled: "var(--type-disabled)",
        },
        action: {
          primary: "var(--action-primary)",
          "primary-hover": "var(--action-primary-hover)",
          "on-primary": "var(--action-on-primary)",
          secondary: "var(--action-secondary)",
          "secondary-border": "var(--action-secondary-border)",
          "secondary-hover": "var(--action-secondary-hover)",
        },
        outline: {
          DEFAULT: "var(--outline-default)",
          focused: "var(--outline-focused)",
        },
        selection: {
          DEFAULT: "var(--selection-default)",
          hover: "var(--selection-hover)",
        },
        divider: "var(--ui-divider)",
        "status-success": {
          bg: "var(--status-success-bg)",
          text: "var(--status-success-text)",
        },
        "status-error": {
          bg: "var(--status-error-bg)",
          text: "var(--status-error-text)",
        },
        "status-warning": {
          bg: "var(--status-warning-bg)",
          text: "var(--status-warning-text)",
        },
        "status-info": {
          bg: "var(--status-info-bg)",
          text: "var(--status-info-text)",
        },
        "status-neutral": {
          bg: "var(--status-neutral-bg)",
          text: "var(--status-neutral-text)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
