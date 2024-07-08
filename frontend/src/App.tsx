import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Assuming your Navbar component is in the same directory
import HomePage from "./pages/HomePage"; // Assuming your Home component is in the same directory
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

const App = () => {

  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <CssBaseline />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/crypto/:id" element={<CryptoDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/create" element={<CreateTransactionPage />} />
        </Routes>
        <ToastContainer
        theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
        />
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;