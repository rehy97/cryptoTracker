import { PaletteMode, ThemeOptions, createTheme } from "@mui/material";
import { amber, grey } from "@mui/material/colors";

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: { main: amber[500] },
    secondary: { main: '#f50057' },
    text: {
      primary: mode === 'light' ? grey[900] : grey[100],
      secondary: mode === 'light' ? grey[700] : grey[500],
    },
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap');
      `,
    },
  },
});

export const createAppTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));