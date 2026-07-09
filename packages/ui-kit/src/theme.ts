export const theme = {
  colors: {
    // Backgrounds
    bg: {
      primary: '#0D1117',       // Main background
      secondary: '#161B22',     // Card backgrounds
      tertiary: '#21262D',      // Hover/active states
      elevated: '#1C2128',      // Modals, dropdowns
    },
    // Text
    text: {
      primary: '#E6EDF3',       // Main text
      secondary: '#8B949E',     // Muted text
      tertiary: '#6E7681',      // Disabled text
      inverse: '#0D1117',       // Text on accent backgrounds
    },
    // Accent colors
    accent: {
      primary: '#58A6FF',       // Primary buttons, links
      secondary: '#3FB950',     // Success, profit, buy
      danger: '#F85149',        // Errors, loss, sell, emergency
      warning: '#D29922',       // Warnings, pending
      info: '#79C0FF',          // Info badges
      purple: '#BC8CFF',       // AI-related elements
    },
    // Border
    border: {
      subtle: '#30363D',        // Card borders
      default: '#484F58',      // Input borders
      strong: '#6E7681',       // Focus rings
    },
    // Status
    status: {
      online: '#3FB950',
      offline: '#6E7681',
      active: '#3FB950',
      suspended: '#F85149',
      pending: '#D29922',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    glow: '0 0 12px rgba(88, 166, 255, 0.15)',
  },
} as const;

export type Theme = typeof theme;
