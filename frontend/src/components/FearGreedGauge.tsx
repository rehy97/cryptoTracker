import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GaugeChart from 'react-gauge-chart';
import { fetchCryptoList } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface FearGreedGaugeProps {
  value: number;
}

const FearGreedGauge: React.FC<FearGreedGaugeProps> = ({ value }) => {
  const theme = useTheme();

  const chartStyle = {
    width: '100%',
  };

  const getSentiment = (value: number) => {
    if (value <= 25) return 'Extreme Fear';
    if (value <= 50) return 'Fear';
    if (value <= 75) return 'Greed';
    return 'Extreme Greed';
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <GaugeChart
        id="fear-greed-gauge"
        nrOfLevels={4}
        colors={[theme.palette.error.main, theme.palette.warning.main, theme.palette.success.light, theme.palette.success.main]}
        arcWidth={0.3}
        percent={value / 100}
        hideText={true}
        needleColor={theme.palette.grey[400]}
        needleBaseColor={theme.palette.grey[700]}
        style={chartStyle}
      />
      <Typography variant="h4" sx={{ mt: 2 }}>{value}</Typography>
      <Typography variant="body1">{getSentiment(value)}</Typography>
    </Box>
  );
};

export default FearGreedGauge;