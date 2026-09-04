import { createTheme } from '@mantine/core'
import {
  PRIMARY_COLOR_PALETTE,
  SECONDARY_COLOR_PALETTE,
  TERTIARY_COLOR_PALETTE,
  colorVariations
} from '../../shared/constants/colors'

export const mantineTheme = createTheme({
  primaryColor: 'primary',
  primaryShade: 5,
  colors: {
    primary: Object.values(PRIMARY_COLOR_PALETTE) as any,
    secondary: Object.values(SECONDARY_COLOR_PALETTE) as any,
    tertiary: Object.values(TERTIARY_COLOR_PALETTE) as any,
    red: Object.values(colorVariations('#c0392b')) as any,
  },
  fontFamily: 'var(--font-outfit), system-ui, sans-serif',
  fontFamilyMonospace: 'var(--font-jbmono), ui-monospace, monospace',
  radius: {
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  defaultRadius: 'md',
  components: {
    Modal: {
      classNames: {
        title: 'text-xl! font-semibold! grow'
      },
    },
  },
})
