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
  Autocomplete,
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

const CryptoList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('preferredCurrency') || 'USD';
  });
  const [currencies, setCurrencies] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRowClick = (id: string) => {
    navigate(`/crypto/${id}`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cryptoData, currencyData] = await Promise.all([
        fetchCryptoList(),
        fetch('https://api.exchangerate-api.com/v4/latest/USD').then(res => res.json())
      ]);
      
      if (cryptoData && cryptoData.length > 0) {
        setCryptocurrencies(cryptoData);
      } else {
        setError("No cryptocurrency data received from the API. Using cached data if available.");
      }

      if (currencyData && currencyData.rates) {
        setCurrencies(currencyData.rates);
      } else {
        setError("No currency data received from the API. Using USD only.");
        setCurrencies({ USD: 1 });
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

  const handleCurrencyChange = (event: React.SyntheticEvent, newValue: string | null) => {
    if (newValue) {
      setCurrency(newValue);
      localStorage.setItem('preferredCurrency', newValue);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleCurrencySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const filteredCurrencies = useMemo(() => {
    return Object.keys(currencies).filter(currencyCode =>
      currencyCode.toLowerCase().includes(currencySearchTerm.toLowerCase())
    );
  }, [currencies, currencySearchTerm]);

  const paginatedCryptocurrencies = useMemo(() => {
    return filteredCryptocurrencies.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
  }, [filteredCryptocurrencies, page]);

  useEffect(() => {
    // Resetovat stránku na 1, když se změní výsledky vyhledávání
    setPage(1);
  }, [filteredCryptocurrencies]);

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
        {filteredCryptocurrencies.length > 0 ? (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
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
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Typography variant="h6" color="text.secondary">
              No cryptocurrencies found matching your search.
            </Typography>
          </Box>
        )}
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