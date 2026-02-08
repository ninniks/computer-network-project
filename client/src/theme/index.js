import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F9A51B',      // Phoenix Flames (arancione)
      light: '#FAC95A',     // Little Sun Dress
      dark: '#E08A00',      // Variante scura
      contrastText: '#fff',
    },
    secondary: {
      main: '#FAC95A',      // Little Sun Dress (giallo)
      light: '#FBD97B',
      dark: '#E0B34D',
      contrastText: '#131313',
    },
    warning: {
      main: '#FAC95A',
    },
    success: {
      main: '#52c41a',
    },
    background: {
      default: '#F9F9F8',   // Doctor
      paper: '#FFFFFF',
    },
    text: {
      primary: '#131313',   // Cursed Black
      secondary: '#919A9F', // Wolverine
    },
    divider: '#DBDBD9',     // Subtle Touch
    grey: {
      100: '#F9F9F8',
      200: '#DBDBD9',
      300: '#DBDBD9',
      500: '#919A9F',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default theme;
