import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import { useThemeContext } from "./theme/ThemeContextProvider";
import { CssBaseline, ThemeProvider } from "@mui/material";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CryptoDetailPage from "./pages/CryptoDetailPage";
import DashboardPage from "./pages/DashboardPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from "./context/useAuth";
import TransactionsPage from "./pages/TransactionsPage";
import CreateTransactionPage from "./pages/CreateTransactionPage";
import IntegrationPage from "./pages/IntegrationPage";
import EditTransactionPage from "./pages/EditTransactionPage";
import SettingsPage from "./pages/SettingsPage";
import MarketPage from "./pages/MarketPage";
import NewsPage from "./pages/NewsPage";

const App = () => {
  const { theme } = useThemeContext();
  const location = useLocation();
  
  // Upravená podmínka pro zobrazení Navbar
  const showNavbar = !["/dashboard", "/transactions", "/create-transaction", "/register", "/login", "/edit-transaction", "/settings", "/market"].includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <CssBaseline />
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/crypto/:id" element={<CryptoDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route path="/create-transaction" element={<CreateTransactionPage type={null} cryptocurrencyId={null} />} />
          <Route path="/edit-transaction" element={<EditTransactionPage/>} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/market" element={<MarketPage />} />
        </Routes>
        <ToastContainer
          theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
        />
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;