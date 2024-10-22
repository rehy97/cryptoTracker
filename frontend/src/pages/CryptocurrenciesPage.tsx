import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Collapse,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BrushIcon from '@mui/icons-material/Brush';
import LayersIcon from '@mui/icons-material/Layers';
import FilterIcon from '@mui/icons-material/Filter';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { fetchCryptoList } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import FearGreedGauge from '../components/FearGreedGauge';
import MetricCard from '../components/MetricCard';
import { amber } from '@mui/material/colors';

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

  const CATEGORIES = [
    { name: 'All', icon: AllInclusiveIcon },
    { name: 'DeFi', icon: AccountBalanceIcon },
    { name: 'NFTs', icon: BrushIcon },
    { name: 'Layer 1', icon: LayersIcon },
    { name: 'Layer 2', icon: FilterIcon },
    { name: 'Meme', icon: EmojiEmotionsIcon },
  ] as const;

  const CategoryChip = React.memo(({ 
    category, 
    isSelected, 
    onClick 
  }: { 
    category: typeof CATEGORIES[number],
    isSelected: boolean,
    onClick: () => void
  }) => {
    const theme = useTheme();
    const Icon = category.icon;
    
    return (
      <Chip
        icon={
          <Icon 
            sx={{ 
              color: isSelected ? amber[500] : theme.palette.text.secondary,
              transition: 'color 0.3s',
            }} 
          />
        }
        label={category.name}
        onClick={onClick}
        sx={{
          mx: 0.5,
          backgroundColor: isSelected ? amber[400] : 'transparent',
          color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
          transition: 'all 0.3s',
          '&:hover': {
            backgroundColor: amber[500],
            '& .MuiChip-icon, & .MuiChip-label': {
              color: theme.palette.common.white,
            },
          },
          '& .MuiChip-icon': {
            color: isSelected ? theme.palette.common.white : theme.palette.text.secondary,
          },
          '& .MuiChip-label': {
            transition: 'color 0.3s',
          },
        }}
      />
    );
  });

  const CryptoTableRow = React.memo(({ 
    crypto, 
    currency, 
    isSmallScreen,
    formatPrice,
    formatPercentage,
    onRowClick
  }: {
    crypto: Cryptocurrency,
    currency: string,
    isSmallScreen: boolean,
    formatPrice: (price: number) => string,
    formatPercentage: (value: number | null) => React.ReactNode,
    onRowClick: (id: string) => void
  }) => {
    const theme = useTheme();
    
    const handleClick = useCallback(() => {
      onRowClick(crypto.id);
    }, [crypto.id, onRowClick]);
  
    return (
      <TableRow
        hover
        onClick={handleClick}
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
    );
  });

  const CryptocurrenciesPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
    // State management with proper typing
    const [state, setState] = useState({
      cryptocurrencies: [] as Cryptocurrency[],
      loading: true,
      error: '',
      fearGreedIndex: null as number | null,
      expandedMetrics: false,
      selectedCategory: 'All',
      searchTerm: '',
      currencySearchTerm: '',
      currency: 'USD',
      currencies: { USD: 1 } as Record<string, number>,
    });
  
    // Memoized metric states
    const [metrics] = useState(() => ({
      marketCap: {
        value: '$2.36T',
        change: '-0.15%',
        chart: Array.from({ length: 30 }, () => ({ value: 2.3 + Math.random() * 0.2 }))
      },
      tradingVolume: {
        value: '$132.41B',
        chart: Array.from({ length: 30 }, () => ({ value: 120 + Math.random() * 25 }))
      },
      btcDominance: {
        value: '42.5%',
        change: '+0.3%',
        chart: Array.from({ length: 30 }, () => ({ value: 42 + Math.random() * 1 }))
      },
      btcFee: {
        value: '$2.34',
        change: '-5.2%',
        chart: Array.from({ length: 30 }, () => ({ value: 2 + Math.random() * 0.5 }))
      },
      ethDominance: {
        value: '18.2%',
        change: '-0.1%',
        chart: Array.from({ length: 30 }, () => ({ value: 18 + Math.random() * 0.5 }))
      },
      ethFee: {
        value: '$3.52',
        change: '+10.5%',
        chart: Array.from({ length: 30 }, () => ({ value: 3 + Math.random() * 1 }))
      }
    }));

    const handleCurrencyChange = useCallback((event: any, value: string | null) => {
      if (value !== null) {
        setState(prev => ({ ...prev, currency: value }));
      }
    }, []);
  
    const toggleMetrics = useCallback(() => {
      setState(prev => ({ ...prev, expandedMetrics: !prev.expandedMetrics }));
    }, []);
  
    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setState(prev => ({ ...prev, searchTerm: event.target.value }));
    }, []);
  
    const handleCurrencySearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setState(prev => ({ ...prev, currencySearchTerm: event.target.value }));
    }, []);
  
    const handleCategorySelect = useCallback((category: string) => {
      setState(prev => ({ ...prev, selectedCategory: category }));
    }, []);
  
    const handleRowClick = useCallback((id: string) => {
      navigate(`/crypto/${id}`);
    }, [navigate]);
  
    // Memoized formatting functions
    const formatPrice = useCallback((priceUSD: number) => {
      const rate = state.currencies[state.currency] || 1;
      const convertedPrice = priceUSD * rate;
      return convertedPrice.toFixed(2);
    }, [state.currencies, state.currency]);
  
    const formatPercentage = useCallback((value: number | null) => {
      if (value === null) return 'N/A';
      
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
    }, [theme.palette]);
  
    // Memoized filtered cryptocurrencies
    const filteredCryptocurrencies = useMemo(() => {
      return state.cryptocurrencies.filter(crypto =>
        crypto.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }, [state.cryptocurrencies, state.searchTerm]);
  
    // Data fetching
    const fetchData = useCallback(async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const [cryptoData, currencyData, fearGreedData] = await Promise.all([
          fetchCryptoList(),
          fetch('https://api.exchangerate-api.com/v4/latest/USD').then(res => res.json()),
          fetch('https://api.alternative.me/fng/').then(res => res.json())
        ]);
        
        setState(prev => ({
          ...prev,
          cryptocurrencies: cryptoData,
          currencies: currencyData.rates,
          fearGreedIndex: parseInt(fearGreedData.data[0].value, 10),
          loading: false,
          error: ''
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setState(prev => ({
          ...prev,
          error: "Failed to fetch data.",
          loading: false
        }));
      }
    }, []);
  
    useEffect(() => {
      fetchData();
    }, [fetchData]);
  
    if (state.loading) {
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
              value={metrics.marketCap.value}
              change={metrics.marketCap.change}
              chart={metrics.marketCap.chart}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MetricCard
              title="24h Trading Volume"
              value={metrics.tradingVolume.value}
              chart={metrics.tradingVolume.chart}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', backgroundColor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom>Fear & Greed Index</Typography>
              <FearGreedGauge value={state.fearGreedIndex ?? 0} />
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Button
            onClick={toggleMetrics}
            endIcon={state.expandedMetrics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 1 }}
          >
            {state.expandedMetrics ? 'Hide' : 'Show'} BTC & ETH Metrics
          </Button>
          <Collapse in={state.expandedMetrics}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <MetricCard
                  title="BTC Dominance"
                  value={metrics.btcDominance.value}
                  change={metrics.btcDominance.change}
                  chart={metrics.btcDominance.chart}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MetricCard
                  title="BTC Network Fee"
                  value={metrics.btcFee.value}
                  change={metrics.btcFee.change}
                  chart={metrics.btcFee.chart}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MetricCard
                  title="ETH Dominance"
                  value={metrics.ethDominance.value}
                  change={metrics.ethDominance.change}
                  chart={metrics.ethDominance.chart}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MetricCard
                  title="ETH Gas Price"
                  value={metrics.ethFee.value}
                  change={metrics.ethFee.change}
                  chart={metrics.ethFee.chart}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2}}>
          <TextField
            label="Search Crypto"
            variant="outlined"
            value={state.searchTerm}
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
              value={state.currency}
              onChange={handleCurrencyChange}
              options={Object.keys(state.currencies)}
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
              <IconButton onClick={fetchData} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          overflow: 'auto',
          backgroundColor: theme.palette.background.paper, // Changed to use the theme's background color
          padding: 2,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          border: `1px solid ${theme.palette.divider}`, // Added a subtle border
        }}>
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = state.selectedCategory === category.name;
            return (
              <Chip
                key={category.name}
                icon={
                  <Icon 
                    sx={{ 
                      color: isSelected ? amber[500] : theme.palette.text.secondary,
                      transition: 'color 0.3s',
                    }} 
                  />
                }
                label={category.name}
                onClick={() => handleCategorySelect(category.name)}
                sx={{
                  mx: 0.5,
                  backgroundColor: isSelected ? amber[400] : 'transparent',
                  color: isSelected ? theme.palette.common.white : theme.palette.text.primary,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: amber[500],
                    '& .MuiChip-icon, & .MuiChip-label': {
                      color: theme.palette.common.white,
                    },
                  },
                  '& .MuiChip-icon': {
                    color: isSelected ? theme.palette.common.white : theme.palette.text.secondary,
                  },
                  '& .MuiChip-label': {
                    transition: 'color 0.3s',
                  },
                }}
              />
            );
          })}
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
                    <TableCell>Current Price ({state.currency})</TableCell>
                    <TableCell>1h</TableCell>
                    <TableCell>24h</TableCell>
                    <TableCell>7d</TableCell>
                    <TableCell>Market Cap ({state.currency})</TableCell>
                    <TableCell>Volume (24h) ({state.currency})</TableCell>
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
                        {crypto.symbol.toUpperCase()} - {state.currency} {formatPrice(crypto.current_price)}
                      </Typography>
                    )}
                  </TableCell>
                  {!isSmallScreen && (
                    <>
                      <TableCell>{crypto.symbol.toUpperCase()}</TableCell>
                      <TableCell>{state.currency} {formatPrice(crypto.current_price)}</TableCell>
                      <TableCell>{formatPercentage(crypto.price_change_percentage_1h_in_currency)}</TableCell>
                      <TableCell>{formatPercentage(crypto.price_change_percentage_24h_in_currency)}</TableCell>
                      <TableCell>{formatPercentage(crypto.price_change_percentage_7d_in_currency)}</TableCell>
                      <TableCell>{state.currency} {formatPrice(crypto.market_cap)}</TableCell>
                      <TableCell>{state.currency} {formatPrice(crypto.total_volume)}</TableCell>
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

export default CryptocurrenciesPage;
