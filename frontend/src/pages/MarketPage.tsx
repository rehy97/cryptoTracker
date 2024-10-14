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
  Chip,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { fetchCryptoList } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const MarketPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHighlights, setShowHighlights] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchCryptoList();
        setCryptocurrencies(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  const formatPercentage = (value: number) => {
    const formattedValue = `${value.toFixed(2)}%`;
    const color = value < 0 ? theme.palette.error.main : theme.palette.success.main;
    const Icon = value < 0 ? TrendingDownIcon : TrendingUpIcon;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', color }}>
        <Icon fontSize="small" />
        <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
          {formattedValue}
        </Typography>
      </Box>
    );
  };

  const trendingCoins = useMemo(() => {
    return cryptocurrencies.slice(0, 3);
  }, [cryptocurrencies]);

  const largestGainers = useMemo(() => {
    return [...cryptocurrencies]
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 3);
  }, [cryptocurrencies]);

  const totalMarketCap = useMemo(() => {
    return cryptocurrencies.reduce((sum, crypto) => sum + crypto.market_cap, 0);
  }, [cryptocurrencies]);

  const total24hVolume = useMemo(() => {
    return cryptocurrencies.reduce((sum, crypto) => sum + crypto.total_volume, 0);
  }, [cryptocurrencies]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cryptocurrency Prices by Market Cap
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          The global cryptocurrency market cap today is ${formatLargeNumber(totalMarketCap)}, a {' '}
          {formatPercentage(cryptocurrencies[0]?.price_change_percentage_24h || 0)} change in the last 24 hours.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', backgroundColor: theme.palette.background.default }}>
              <Typography variant="h6" gutterBottom>Market Cap</Typography>
              <Typography variant="h4">${formatLargeNumber(totalMarketCap)}</Typography>
              {formatPercentage(cryptocurrencies[0]?.price_change_percentage_24h || 0)}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', backgroundColor: theme.palette.background.default }}>
              <Typography variant="h6" gutterBottom>24h Trading Volume</Typography>
              <Typography variant="h4">${formatLargeNumber(total24hVolume)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', backgroundColor: theme.palette.background.default }}>
              <Typography variant="h6" gutterBottom>Trending</Typography>
              {trendingCoins.map((coin) => (
                <Box key={coin.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{coin.name}</Typography>
                  <Typography>${coin.current_price.toFixed(2)}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Top Cryptocurrencies</Typography>
          <FormControlLabel
            control={<Switch checked={showHighlights} onChange={() => setShowHighlights(!showHighlights)} />}
            label="Highlights"
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Coin</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">1h</TableCell>
                <TableCell align="right">24h</TableCell>
                <TableCell align="right">7d</TableCell>
                <TableCell align="right">24h Volume</TableCell>
                <TableCell align="right">Market Cap</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cryptocurrencies.map((crypto, index) => (
                <TableRow 
                  key={crypto.id}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                    ...(showHighlights && index < 3 ? { backgroundColor: theme.palette.action.selected } : {})
                  }}
                  onClick={() => navigate(`/crypto/${crypto.id}`)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img src={crypto.image} alt={crypto.name} style={{ width: 24, height: 24, marginRight: 8 }} />
                      <Typography>{crypto.name}</Typography>
                      <Typography color="text.secondary" sx={{ ml: 1 }}>
                        {crypto.symbol.toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">${crypto.current_price.toFixed(2)}</TableCell>
                  <TableCell align="right">{formatPercentage(crypto.price_change_percentage_1h_in_currency)}</TableCell>
                  <TableCell align="right">{formatPercentage(crypto.price_change_percentage_24h)}</TableCell>
                  <TableCell align="right">{formatPercentage(crypto.price_change_percentage_7d_in_currency)}</TableCell>
                  <TableCell align="right">${formatLargeNumber(crypto.total_volume)}</TableCell>
                  <TableCell align="right">${formatLargeNumber(crypto.market_cap)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default MarketPage;