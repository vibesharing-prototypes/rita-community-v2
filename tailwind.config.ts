import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "4px",
        md: "8px",       // not used directly — prefer Atlas token names below
        lg: "8px",       // Atlas md
        xl: "12px",      // Atlas lg
        "2xl": "16px",
        "3xl": "24px",   // Atlas xl
        "[36px]": "36px", // Atlas xxl
        full: "9999px",
      },
      colors: {
        /* Background */
        background: {
          base: "var(--background-base)",
          "base-gradient-start": "var(--background-base-gradient-start)",
          "base-gradient-end": "var(--background-base-gradient-end)",
          backdrop: "var(--background-backdrop)",
        },

        /* Surface */
        surface: {
          DEFAULT: "var(--surface-default)",
          variant: "var(--surface-variant)",
          "variant-subtle": "var(--surface-variant-subtle)",
        },

        /* Type */
        type: {
          DEFAULT: "var(--type-default)",
          muted: "var(--type-muted)",
          disabled: "var(--type-disabled)",
        },

        /* Action — Primary */
        "action-primary": {
          DEFAULT: "var(--action-primary-default)",
          "gradient-start": "var(--action-primary-default-gradient-start)",
          "gradient-end": "var(--action-primary-default-gradient-end)",
          "hover-start": "var(--action-primary-hover-gradient-start)",
          "hover-end": "var(--action-primary-hover-gradient-end)",
          "active-start": "var(--action-primary-active-gradient-start)",
          "active-end": "var(--action-primary-active-gradient-end)",
          disabled: "var(--action-primary-disabled)",
          "on-primary": "var(--action-primary-on-primary)",
          "on-primary-disabled": "var(--action-primary-on-primary-disabled)",
        },

        /* Action — Secondary */
        "action-secondary": {
          DEFAULT: "var(--action-secondary-variant)",
          variant: "var(--action-secondary-variant)",
          hover: "var(--action-secondary-hover)",
          active: "var(--action-secondary-active)",
          "on-secondary": "var(--action-secondary-on-secondary)",
          "on-secondary-disabled": "var(--action-secondary-on-secondary-disabled)",
          outline: "var(--action-secondary-outline)",
          "outline-disabled": "var(--action-secondary-outline-disabled)",
        },

        /* Action — Link */
        "action-link": {
          DEFAULT: "var(--action-link-default)",
          hover: "var(--action-link-hover)",
          active: "var(--action-link-active)",
          disabled: "var(--action-link-disabled)",
        },

        /* Action — Destructive */
        "action-destructive": {
          "gradient-start": "var(--action-destructive-default-gradient-start)",
          "gradient-end": "var(--action-destructive-default-gradient-end)",
          "hover-start": "var(--action-destructive-hover-gradient-start)",
          "hover-end": "var(--action-destructive-hover-gradient-end)",
          disabled: "var(--action-destructive-disabled)",
          "on-destructive": "var(--action-destructive-on-destructive)",
          "secondary-default": "var(--action-destructive-secondary-default)",
        },

        /* Action — Form */
        "action-form": {
          outline: "var(--action-form-outline)",
          "outline-selected": "var(--action-form-outline-selected)",
          "outline-disabled": "var(--action-form-outline-disabled)",
          indicator: "var(--action-form-indicator)",
          error: "var(--action-form-error)",
        },

        /* Outline */
        outline: {
          static: "var(--outline-static)",
          DEFAULT: "var(--outline-default)",
          hover: "var(--outline-hover)",
          active: "var(--outline-active)",
          disabled: "var(--outline-disabled)",
        },

        /* UI */
        ui: {
          "focus-main": "var(--ui-focus-main)",
          "divider-default": "var(--ui-divider-default)",
          "divider-secondary": "var(--ui-divider-secondary)",
          "loading-default": "var(--ui-loading-default)",
          "loading-variant": "var(--ui-loading-variant)",
          "scrollbar-handle": "var(--ui-scrollbar-handle)",
        },

        /* Selection — Primary */
        selection: {
          DEFAULT: "var(--selection-primary-default)",
          hover: "var(--selection-primary-hover)",
          active: "var(--selection-primary-active)",
          "on-selected": "var(--selection-primary-on-selected)",
          indicator: "var(--selection-primary-indicator)",
        },

        /* Selection — Secondary */
        "selection-secondary": {
          DEFAULT: "var(--selection-secondary-default)",
          hover: "var(--selection-secondary-hover)",
        },

        /* Status — Success */
        "status-success": {
          bg: "var(--status-success-bg-default)",
          content: "var(--status-success-content-default)",
          "bg-variant": "var(--status-success-bg-variant)",
          "content-variant": "var(--status-success-content-variant)",
        },

        /* Status — Error */
        "status-error": {
          bg: "var(--status-error-bg-default)",
          content: "var(--status-error-content-default)",
          "bg-variant": "var(--status-error-bg-variant)",
          "content-variant": "var(--status-error-content-variant)",
        },

        /* Status — Warning */
        "status-warning": {
          bg: "var(--status-warning-bg-default)",
          content: "var(--status-warning-content-default)",
          "bg-variant": "var(--status-warning-bg-variant)",
          "content-variant": "var(--status-warning-content-variant)",
        },

        /* Status — Notification (info) */
        "status-notification": {
          bg: "var(--status-notification-bg-default)",
          content: "var(--status-notification-content-default)",
          "bg-variant": "var(--status-notification-bg-variant)",
          "content-variant": "var(--status-notification-content-variant)",
        },

        /* Status — Neutral */
        "status-neutral": {
          bg: "var(--status-neutral-bg-default)",
          content: "var(--status-neutral-content-default)",
          "bg-variant": "var(--status-neutral-bg-variant)",
          "content-variant": "var(--status-neutral-content-variant)",
        },

        /* Status — New */
        "status-new": {
          bg: "var(--status-new-bg-default)",
          content: "var(--status-new-content-default)",
        },

        /* Accent */
        accent: {
          "highlighted-bg": "var(--accent-highlighted-bg)",
          "highlighted-content": "var(--accent-highlighted-content)",
          "yellow-bg": "var(--accent-yellow-bg)",
          "yellow-content": "var(--accent-yellow-content)",
          "green-bg": "var(--accent-green-bg)",
          "green-content": "var(--accent-green-content)",
          "blue-bg": "var(--accent-blue-bg)",
          "blue-content": "var(--accent-blue-content)",
          "purple-bg": "var(--accent-purple-bg)",
          "purple-content": "var(--accent-purple-content)",
          "gray-bg": "var(--accent-gray-bg)",
          "gray-content": "var(--accent-gray-content)",
        },

        /* AI */
        ai: {
          "gradient-start": "var(--ai-gradient-start)",
          "gradient-middle": "var(--ai-gradient-middle)",
          "gradient-end": "var(--ai-gradient-end)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
