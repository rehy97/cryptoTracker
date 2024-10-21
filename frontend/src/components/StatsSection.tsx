import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';

interface Stat {
  label: string;
  value: number;
}

const StatsSection: React.FC = () => {
  const stats: Stat[] = [
    { label: 'Uživatelé', value: 1000 },
    { label: 'Kryptoměny', value: 150 },
    { label: 'Transakce za den', value: 2500 },
    { label: 'Aktivní projekty', value: 50 },
  ];

  return (
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Klíčové Statistiky
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Typography variant="h2" color="primary" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {stat.label}
              </Typography>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsSection;