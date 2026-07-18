/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // MapLibre injects these class names into the DOM at runtime (never typed
  // literally in our source), so the content scanner can't see them — without
  // this safelist entry the @layer base overrides in globals.css get purged.
  safelist: ['maplibregl-popup-content', 'maplibregl-popup-tip'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        geist: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        // Full OKLCH tokens from Studio; relative color keeps /opacity modifiers working
        border: 'oklch(from var(--border) l c h / <alpha-value>)',
        input: 'oklch(from var(--input) l c h / <alpha-value>)',
        ring: 'oklch(from var(--ring) l c h / <alpha-value>)',
        background: 'oklch(from var(--background) l c h / <alpha-value>)',
        foreground: 'oklch(from var(--foreground) l c h / <alpha-value>)',
        primary: {
          DEFAULT: 'oklch(from var(--primary) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--primary-foreground) l c h / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'oklch(from var(--secondary) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--secondary-foreground) l c h / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'oklch(from var(--destructive) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--destructive-foreground) l c h / <alpha-value>)',
        },
        success: {
          DEFAULT: 'oklch(from var(--success) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--success-foreground) l c h / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'oklch(from var(--warning) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--warning-foreground) l c h / <alpha-value>)',
          muted: 'oklch(from var(--warning-muted) l c h / <alpha-value>)',
          'muted-foreground': 'oklch(from var(--warning-muted-foreground) l c h / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'oklch(from var(--muted) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--muted-foreground) l c h / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(from var(--accent) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--accent-foreground) l c h / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'oklch(from var(--popover) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--popover-foreground) l c h / <alpha-value>)',
        },
        card: {
          DEFAULT: 'oklch(from var(--card) l c h / <alpha-value>)',
          foreground: 'oklch(from var(--card-foreground) l c h / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) * 0.8)',
        sm: 'calc(var(--radius) * 0.6)',
        xl: 'calc(var(--radius) * 1.4)',
        '2xl': 'calc(var(--radius) * 1.8)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        inset: 'var(--shadow-inset)',
      },
      fontSize: {
        'fluid-xs': 'var(--text-xs)',
        'fluid-sm': 'var(--text-sm)',
        'fluid-base': 'var(--text-base)',
        'fluid-lg': 'var(--text-lg)',
        'fluid-xl': 'var(--text-xl)',
        'fluid-2xl': 'var(--text-2xl)',
        'fluid-3xl': 'var(--text-3xl)',
        display: 'var(--text-display)',
      },
      animation: {
        'fade-up': 'fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
