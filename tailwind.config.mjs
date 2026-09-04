import {
  PRIMARY_COLOR_PALETTE,
  SECONDARY_COLOR_PALETTE,
  TERTIARY_COLOR_PALETTE,
} from './shared/constants/colors';

export default {
  darkMode: ['class', '[data-mantine-color-scheme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: PRIMARY_COLOR_PALETTE,
        secondary: SECONDARY_COLOR_PALETTE,
        tertiary: TERTIARY_COLOR_PALETTE,
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'ui-monospace', 'monospace'],
      },
    },
  },
};
