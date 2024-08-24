import { PaletteMode, ThemeOptions } from "@mui/material";
import { amber, deepOrange, grey } from "@mui/material/colors";

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => {
  return {
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: amber,
            secondary: deepOrange,
            error: {
              main: grey[900],
            },
            background: {
              default: grey[100],
              paper: grey[50],
            },
            text: {
              primary: grey[900],
              secondary: grey[700],
            },
          }
        : {
            primary: amber,
            secondary: deepOrange,
            error: {
              main: grey[300],
            },
            background: {
              default: grey[900],
              paper: grey[800],
            },
            text: {
              primary: grey[100],
              secondary: grey[500],
            },
          }),
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
  };
};