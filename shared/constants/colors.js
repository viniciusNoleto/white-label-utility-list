import Color from 'color'

export const PRIMARY_COLOR = '#51aeda'

export const SECONDARY_COLOR = '#881FF9'

export const TERTIARY_COLOR = '#2482ED'

export const PRIMARY_COLOR_PALETTE = colorVariations(PRIMARY_COLOR)

export const SECONDARY_COLOR_PALETTE = colorVariations(SECONDARY_COLOR)

export const TERTIARY_COLOR_PALETTE = colorVariations(TERTIARY_COLOR)


function lighten(clr, val) {
  return Color(clr).lighten(val).hex();
}

function darken(clr, val) {
  return Color(clr).darken(val).hex();
}

export function colorVariations(color) {
  return {
    50: lighten(color, 0.5),
    100: lighten(color, 0.4),
    200: lighten(color, 0.3),
    300: lighten(color, 0.2),
    400: lighten(color, 0.1),
    500: color,
    600: darken(color, 0.1),
    700: darken(color, 0.2),
    800: darken(color, 0.3),
    900: darken(color, 0.4),
    950: darken(color, 0.5),
  };
}
