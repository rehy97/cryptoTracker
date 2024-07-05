import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Assuming your Navbar component is in the same directory
import HomePage from "./pages/HomePage"; // Assuming your Home component is in the same directory
import { useThemeContext } from "./theme/ThemeContextProvider";
import { CssBaseline, ThemeProvider } from "@mui/material";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CryptoDetailPage from "./pages/CryptoDetailPage";

const App = () => {

  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/crypto/:id" element={<CryptoDetailPage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;