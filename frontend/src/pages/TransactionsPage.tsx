import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Avatar, TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  Button, IconButton, Tooltip, Pagination, Container, Grid, Card, CardContent
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchCryptoList } from '../utils/api';
import { debounce } from 'lodash';

interface Transaction {
  id: number;
  cryptocurrencyId: string;
  amount: number;
  date: string;
  type: 'buy' | 'sell';
  unitPrice: number;
  totalPrice: number;
}

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

const ITEMS_PER_PAGE = 10;

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[800]}`,
  color: theme.palette.common.white,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[800],
  },
}));

const DarkTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: theme.palette.common.white,
    '& fieldset': {
      borderColor: theme.palette.grey[700],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.grey[500],
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.grey[500],
  },
}));

const DarkSelect = styled(Select)(({ theme }) => ({
  color: theme.palette.common.white,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[700],
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[500],
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));


const TransactionsPage: React.FC = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterCrypto, setFilterCrypto] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionsResponse, cryptoListResponse] = await Promise.all([
        axios.get<Transaction[]>('http://localhost:5221/api/Transaction'),
        fetchCryptoList()
      ]);
      setTransactions(transactionsResponse.data);
      setCryptocurrencies(cryptoListResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const getCryptoInfo = useCallback((id: string) => {
    return cryptocurrencies.find(crypto => crypto.id === id) || { symbol: id, name: id, image: '' };
  }, [cryptocurrencies]);

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter(t => 
        (filterType === 'all' || t.type === filterType) &&
        (filterCrypto === 'all' || t.cryptocurrencyId === filterCrypto) &&
        (t.cryptocurrencyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         getCryptoInfo(t.cryptocurrencyId).name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [transactions, filterType, filterCrypto, searchTerm, sortOrder, getCryptoInfo]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTransactions, page]);

  const groupedTransactions = useMemo(() => {
    return paginatedTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [paginatedTransactions]);

  const getTransactionIcon = (type: 'buy' | 'sell') => {
    return type === 'buy' ? 
      <ArrowDownwardIcon sx={{ color: 'green' }} /> : 
      <ArrowUpwardIcon sx={{ color: 'red' }} />;
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', pt: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={fetchData}
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#121212"  }}>
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'grey.900', minHeight: '100vh', backgroundColor: "#121212" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
        Transactions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <DarkTextField 
            label="Search" 
            variant="outlined" 
            fullWidth
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1, color: 'grey.500' }} />,
            }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
            <DarkSelect
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value as 'all' | 'buy' | 'sell')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
            </DarkSelect>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'grey.500' }}>Crypto</InputLabel>
            <DarkSelect
              value={filterCrypto}
              label="Crypto"
              onChange={(e) => setFilterCrypto(e.target.value as string)}
            >
              <MenuItem value="all">All</MenuItem>
              {cryptocurrencies.map(crypto => (
                <MenuItem key={crypto.id} value={crypto.id}>{crypto.name}</MenuItem>
              ))}
            </DarkSelect>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title="Toggle sort order">
          <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} sx={{ color: 'grey.500' }}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh data">
          <IconButton onClick={fetchData} sx={{ color: 'grey.500' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <StyledCard key={date} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.secondary' }}>{date}</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Type</StyledTableCell>
                    <StyledTableCell>Asset</StyledTableCell>
                    <StyledTableCell>Amount</StyledTableCell>
                    <StyledTableCell>Unit Price</StyledTableCell>
                    <StyledTableCell>Total</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dayTransactions.map((transaction) => {
                    const cryptoInfo = getCryptoInfo(transaction.cryptocurrencyId);
                    return (
                      <StyledTableRow key={transaction.id}>
                        <StyledTableCell>
                          <Chip 
                            icon={getTransactionIcon(transaction.type)} 
                            label={transaction.type === 'buy' ? 'Buy' : 'Sell'}
                            color={transaction.type === 'buy' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={cryptoInfo.image}
                              alt={cryptoInfo.name}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'common.white' }}>
                              {cryptoInfo.symbol.toUpperCase()}
                            </Typography>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: transaction.type === 'buy' ? 'success.main' : 'error.main',
                              fontWeight: 'bold'
                            }}
                          >
                            {transaction.type === 'buy' ? '+' : '-'}{transaction.amount}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2" sx={{ color: 'common.white' }}>Ft{transaction.unitPrice.toFixed(2)}</Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'common.white' }}>
                            Ft{transaction.totalPrice.toFixed(2)}
                          </Typography>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination 
          count={Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE)} 
          page={page} 
          onChange={handlePageChange} 
          color="primary" 
          size="large"
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '1rem',
              color: 'common.white',
            },
          }}
        />
      </Box>
    </Container>
    </Box>
  );
};

export default TransactionsPage;