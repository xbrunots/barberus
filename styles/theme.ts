import { theme, DefaultTheme } from '@chakra-ui/core'

const customTheme: DefaultTheme = {
  ...theme,
  fonts: {
    body: 'Quicksand,system-ui,sans-serif',
    heading: 'Quicksand,system-ui,sans-serif',
    mono: 'Libre Caslon Text, monospace'
  },
  fontWeights: {
    ...theme.fontWeights,
    light: 300,
    normal: 400,
    medium: 600,
    bold: 700,
  },
  radii: {
    ...theme.radii,
    sm: '5px',
    md: '8px',
  },
  colors: {
    ...theme.colors,
    purple: {
      ...theme.colors.gray,
      400: '#8257e5',
      500: '#8257e5',
      700: '#ffffff',
      600: '#141414',
      800: '#202020',
      900: '#000000'
    },
    gray: {
      ...theme.colors.gray,
      300: '#e1e1e6',
      600: '#29292e',
      700: '#202024',
      800: '#121214'
    },
  },
}

export default customTheme;