import { PaletteMode } from "@mui/material";
import { amber, deepOrange, grey } from "@mui/material/colors";

export const getDesignTokens = (mode: PaletteMode) => {
    return {
        palette: {
            mode,
            ...(mode === "light"
                ? {
                    // Use light mode color tokens
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
                    // Use dark mode color tokens
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
    };
};