import React from "react";
import Hero from "../components/Hero";
import CryptoList from "../components/CryptoList";
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import StatsSection from "../components/StatsSection";

const HomePage = () => {
  return (
    <div>
        <main>
          <Hero />
          <Box sx={{ my: 4 }}>
                    <CryptoList />
            </Box>
            <StatsSection />
        </main>
    </div>
  );
};

export default HomePage;