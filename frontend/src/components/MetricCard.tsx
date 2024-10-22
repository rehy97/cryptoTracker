import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  useTheme,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GaugeChart from 'react-gauge-chart';
import { amber } from '@mui/material/colors';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: string;
  chart?: { value: number }[];
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, chart }) => {
    const theme = useTheme();
  
    return (
      <Paper sx={{ p: 2, height: '100%', backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="h4">{value}</Typography>
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', color: change.startsWith('-') ? 'error.main' : 'success.main' }}>
            {change.startsWith('-') ? <TrendingDownIcon /> : <TrendingUpIcon />}
            <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
              {change}
            </Typography>
          </Box>
        )}
        {chart && (
          <Box sx={{ height: 100, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <Line type="monotone" dataKey="value" stroke={amber[500]} dot={false} />
                <YAxis domain={['dataMin', 'dataMax']} hide />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

export default MetricCard;