import React from "react";
import Hero from "../components/Hero";
import CryptoList from "../components/CryptoList";
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const Home = () => {
  return (
    <div>
        <main>
          <Hero />
          <Box sx={{ my: 4 }}>
                    <CryptoList />
            </Box>
        </main>
    </div>
  );
};

export default Home;