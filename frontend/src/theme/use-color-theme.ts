import { createTheme, PaletteMode } from "@mui/material";
import React from "react";
import { getDesignTokens } from "./theme";

export const useColorTheme = () => {
  const [mode, setMode] = React.useState<PaletteMode>("dark");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const modifiedTheme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return { theme: modifiedTheme, mode, toggleTheme};

};