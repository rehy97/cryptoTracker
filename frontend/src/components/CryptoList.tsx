import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Avatar,
  Snackbar,
  Alert,
  Container,
  Chip,
  useMediaQuery,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Pagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchCryptoList } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

// Static exchange rates (1 USD to X)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.84,
  GBP: 0.72,
  JPY: 110.14,
  CAD: 1.25,
  AUD: 1.34,
  CHF: 0.92,
  CNY: 6.47,
  INR: 74.37,
  BRL: 5.25,
};

const CryptoList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRowClick = (id: number) => {
    navigate(`/crypto/${id}`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchCryptoList();
      if (data && data.length > 0) {
        setCryptocurrencies(data);
      } else {
        setError("No data received from the API. Using cached data if available.");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to fetch data. Using cached data if available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrency(event.target.value as keyof typeof EXCHANGE_RATES);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const formatPrice = (priceUSD: number) => {
    const rate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
    return (priceUSD * rate).toFixed(2);
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

  const paginatedCryptocurrencies = useMemo(() => {
    return filteredCryptocurrencies.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
  }, [filteredCryptocurrencies, page]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[3],
          p: 3,
          mt: 4,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold" color="primary">
          Featured Cryptocurrencies
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2}}>
          <TextField
            select
            label="Currency"
            value={currency}
            onChange={handleCurrencyChange}
            sx={{ width: 120 }}
          >
            {Object.keys(EXCHANGE_RATES).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                {!isSmallScreen && (
                  <>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Current Price</TableCell>
                    <TableCell>1h</TableCell>
                    <TableCell>24h</TableCell>
                    <TableCell>7d</TableCell>
                    <TableCell>Market Cap</TableCell>
                    <TableCell>Volume (24h)</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCryptocurrencies.map((crypto) => (
                <TableRow
                  key={crypto.id}
                  hover
                  onClick={() => handleRowClick(crypto.id)}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredCryptocurrencies.length / ITEMS_PER_PAGE)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="warning" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CryptoList;