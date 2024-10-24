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
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { fetchCryptoList } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import FearGreedGauge from '../components/FearGreedGauge';
import MetricCard from '../components/MetricCard';

const MarketPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  interface Cryptocurrency {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    price_change_percentage_1h_in_currency: number;
    price_change_percentage_24h_in_currency: number;
    price_change_percentage_7d_in_currency: number;
    market_cap: number;
    total_volume: number;
  }
  
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fearGreedIndex, setFearGreedIndex] = useState<number | null>(null);
  const [marketCap, setMarketCap] = useState<{ value: string, change: string, chart: { value: number }[] }>({ value: '$2.36T', change: '-0.15%', chart: [] });
  const [tradingVolume, setTradingVolume] = useState<{ value: string, chart: { value: number }[] }>({ value: '$132.41B', chart: [] });
  const [btcDominance, setBtcDominance] = useState<{ value: string, change: string, chart: { value: number }[] }>({ value: '42.5%', change: '+0.3%', chart: [] });
  const [btcFee, setBtcFee] = useState<{ value: string, change: string, chart: { value: number }[] }>({ value: '$2.34', change: '-5.2%', chart: [] });
  const [ethDominance, setEthDominance] = useState<{ value: string, change: string, chart: { value: number }[] }>({ value: '18.2%', change: '-0.1%', chart: [] });
  const [ethFee, setEthFee] = useState<{ value: string, change: string, chart: { value: number }[] }>({ value: '$3.52', change: '+10.5%', chart: [] });
  const [currency, setCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState<{ [key: string]: number }>({ USD: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cryptoData, currencyData, fearGreedData] = await Promise.all([
        fetchCryptoList(),
        fetch('https://api.exchangerate-api.com/v4/latest/USD').then(res => res.json()),
        fetch('https://api.alternative.me/fng/').then(res => res.json())
      ]);
      
      setCryptocurrencies(cryptoData);
      setCurrencies(currencyData.rates);
      setFearGreedIndex(parseInt(fearGreedData.data[0].value, 10));

      // Simulace dat pro nové metriky
      setMarketCap({
        value: '$2.36T',
        change: '-0.15%',
        chart: Array.from({ length: 30 }, (_, i) => ({ value: 2.3 + Math.random() * 0.2 }))
      });
      setTradingVolume({
        value: '$132.41B',
        chart: Array.from({ length: 30 }, (_, i) => ({ value: 120 + Math.random() * 25 }))
      });
      setBtcDominance({
        value: '42.5%',
        change: '+0.3%',
        chart: Array.from({ length: 30 }, (_, i) => ({ value: 42 + Math.random() * 1 }))
      });
      setBtcFee({
        value: '$2.34',
        change: '-5.2%',
        chart: Array.from({ length: 30 }, (_, i) => ({ value: 2 + Math.random() * 0.5 }))
      });
      setEthDominance({
        value: '18.2%',
        change: '-0.1%',
        chart: Array.from({ length: 30 }, (_, i) => ({ value: 18 + Math.random() * 0.5 }))
      });
      setEthFee({
        value: '$3.52',
        change: '+10.5%',
        chart: Array.from({ length: 30 }, (_, i) => ({ value: 3 + Math.random() * 1 }))
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCurrencyChange = (event: any, value: string | null) => {
    if (value !== null) {
      setCurrency(value);
    }
  };

  const handleSearchChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSearchTerm(event.target.value);
  };

  const handleCurrencySearchChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setCurrencySearchTerm(event.target.value);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const formatPrice = (priceUSD: number) => {
    const rate = currencies[currency] || 1;
    const convertedPrice = priceUSD * rate;
    return convertedPrice.toFixed(2);
  };

  const formatPercentage = (value: number | null) => {
    if (value !== null) {
      const formattedValue = `${value.toFixed(2)}%`;
      let color = theme.palette.text.primary;

      if (value < 0) {
        color = theme.palette.error.main;
      } else if (value > 0) {
        color = theme.palette.success.main;
      }

      return (
        <Chip
          label={formattedValue}
          size="small"
          sx={{
            backgroundColor: `${color}20`,
            color: color,
            fontWeight: 'bold',
          }}
        />
      );
    } else {
      return 'N/A';
    }
  };

  const filteredCryptocurrencies = useMemo(() => {
    return cryptocurrencies.filter(crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cryptocurrencies, searchTerm]);

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
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
          Cryptocurrency Market Overview
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="Market Cap"
              value={marketCap.value}
              change={marketCap.change}
              chart={marketCap.chart}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="24h Trading Volume"
              value={tradingVolume.value}
              chart={tradingVolume.chart}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', backgroundColor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom>Fear & Greed Index</Typography>
              <FearGreedGauge value={fearGreedIndex ?? 0} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="BTC Dominance"
              value={btcDominance.value}
              change={btcDominance.change}
              chart={btcDominance.chart}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="BTC Network Fee"
              value={btcFee.value}
              change={btcFee.change}
              chart={btcFee.chart}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="ETH Dominance"
              value={ethDominance.value}
              change={ethDominance.change}
              chart={ethDominance.chart}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="ETH Gas Price"
              value={ethFee.value}
              change={ethFee.change}
              chart={ethFee.chart}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2}}>
          <TextField
            label="Search Crypto"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete
              value={currency}
              onChange={handleCurrencyChange}
              options={Object.keys(currencies)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Currency" 
                  onChange={handleCurrencySearchChange}
                  placeholder="Search currency"
                />
              )}
              sx={{ width: 200 }}
            />
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                {!isSmallScreen && (
                  <>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Current Price ({currency})</TableCell>
                    <TableCell>1h</TableCell>
                    <TableCell>24h</TableCell>
                    <TableCell>7d</TableCell>
                    <TableCell>Market Cap ({currency})</TableCell>
                    <TableCell>Volume (24h) ({currency})</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCryptocurrencies.map((crypto) => (
                <TableRow
                  key={crypto.id}
                  hover
                  onClick={() => navigate(`/crypto/${crypto.id}`)}
                  sx={{
                    cursor: "pointer",
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}10`,
                    },
                  }}
                >
                  <TableCell>
                    <Avatar alt={crypto.name} src={crypto.image} sx={{ width: 40, height: 40 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">{crypto.name}</Typography>
                    {isSmallScreen && (
                      <Typography variant="body2" color="text.secondary">
                        {crypto.symbol.toUpperCase()} - {currency} {formatPrice(crypto.current_price)}
                      </Typography>
                    )}
                  </TableCell>
                  {!isSmallScreen && (
                    <>
                      <TableCell>{crypto.symbol.toUpperCase()}</TableCell>
                      <TableCell>{currency} {formatPrice(crypto.current_price)}</TableCell>
                      <TableCell>{formatPercentage(crypto.price_change_percentage_1h_in_currency)}</TableCell>
                      <TableCell>{formatPercentage(crypto.price_change_percentage_24h_in_currency)}</TableCell>
                      <TableCell>{formatPercentage(crypto.price_change_percentage_7d_in_currency)}</TableCell>
                      <TableCell>{currency} {formatPrice(crypto.market_cap)}</TableCell>
                      <TableCell>{currency} {formatPrice(crypto.total_volume)}</TableCell>
                    </>
                  )}
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
