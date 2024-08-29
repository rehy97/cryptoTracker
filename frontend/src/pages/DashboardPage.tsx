import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid, Card, CardContent, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme, ThemeProvider, createTheme, CssBaseline, Button, Chip, Avatar, LinearProgress, Select, MenuItem, FormControl, InputLabel, TextField, Tab, Tabs, PaletteMode, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { amber } from '@mui/material/colors';
import PortfolioCard from '../components/PortfolioCard';
import PortfolioPerformanceChart from '../components/PortfolioPerformanceGraph';
import CryptoDistributionChart from '../components/CryptoDistributionChart';
import AddTransactionFab from '../components/AddTransactionFab';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface PortfolioItem {
  cryptocurrencyId: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
}

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface PortfolioItemWithCoinData extends PortfolioItem {
  coinData?: CoinData;
}

interface Transaction {
  cryptocurrencyId: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  type: 'buy' | 'sell';
  unitPrice: number;
  totalPrice: number;
}

const DashboardPage = () => {
  const [mode, setMode] = useState<PaletteMode>('dark');
  const navigate = useNavigate();
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: amber[500] },
      secondary: { main: '#f50057' },
    },
  }), [mode]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioItemWithCoinData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      const portfolioResponse = await axios.get<PortfolioItem[]>('http://localhost:5221/api/Portfolio');
      const portfolioWithCoinData = await Promise.all(
        portfolioResponse.data.map(async (item) => {
          try {
            const coinResponse = await axios.get<CoinData>(`http://localhost:5221/api/Coin/${item.cryptocurrencyId}`);
            return { ...item, coinData: coinResponse.data };
          } catch (err) {
            console.error(`Failed to fetch data for ${item.cryptocurrencyId}`, err);
            return item;
          }
        })
      );
      setPortfolio(portfolioWithCoinData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch portfolio data');
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get<Transaction[]>('http://localhost:5221/api/Transaction');
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      setError('Failed to fetch transaction data');
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
    fetchTransactions();
  }, [fetchPortfolioData, fetchTransactions]);

  const cryptos = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', amount: 2, valueUsd: 60000, change: 2.5, icon: '₿', price: 30000, color: '#F7931A' },
    { id: 2, name: 'Ethereum', symbol: 'ETH', amount: 10, valueUsd: 40000, change: -1.2, icon: 'Ξ', price: 4000, color: '#627EEA' },
    { id: 3, name: 'Litecoin', symbol: 'LTC', amount: 20, valueUsd: 8000, change: 0.8, icon: 'Ł', price: 400, color: '#BFBBBB' },
    { id: 4, name: 'Ripple', symbol: 'XRP', amount: 100, valueUsd: 3000, change: 3.7, icon: '✕', price: 30, color: '#23292F' },
  ];

  const performanceData = {
    '7d': [
      { date: '2023-08-18', value: 100000 },
      { date: '2023-08-19', value: 102000 },
      { date: '2023-08-20', value: 103000 },
      { date: '2023-08-21', value: 101000 },
      { date: '2023-08-22', value: 104000 },
      { date: '2023-08-23', value: 106000 },
      { date: '2023-08-24', value: 105000 },
    ],
    '1m': [
      { date: '2023-07-24', value: 95000 },
      // ... (další data pro 1 měsíc)
      { date: '2023-08-24', value: 105000 },
    ],
    '3m': [
      { date: '2023-05-24', value: 85000 },
      // ... (další data pro 3 měsíce)
      { date: '2023-08-24', value: 105000 },
    ],
    '1y': [
      { date: '2022-08-24', value: 70000 },
      // ... (další data pro 1 rok)
      { date: '2023-08-24', value: 105000 },
    ],
    'all': [
      { date: '2021-08-24', value: 50000 },
      // ... (další data pro celé období)
      { date: '2023-08-24', value: 105000 },
    ],
  };

  const notifications = [
    { id: 1, message: 'Bitcoin price alert: BTC has increased by 5% in the last hour', read: false },
    { id: 2, message: 'New feature: Portfolio analytics now available', read: true },
  ];

  const portfolioData = {
    totalValue: 111000,
    changes: {
      '24h': 15.5,
      '7d': 10.2,
      '1m': 25.7,
      '3m': 40.3,
      '1y': 150.8
    },
    profitPercentage: 65,
    estimatedAnnualReturn: 42.5,
    realizedProfit: 12500,
    marketSentiment: 'Bullish',
    alert: 'Market volatility is high. Consider reviewing your portfolio.'
  };

  const toggleDrawer = (open : any) => (event : any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleTransactionClick = (cryptocurrencyId : string, type : string) => {
    navigate(`/create`, { state: { cryptocurrencyId, type } });
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <List>
        {['Dashboard', 'Portfolio', 'Market', 'Settings'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index === 0 ? <DashboardIcon /> : 
               index === 1 ? <AccountBalanceWalletIcon /> : 
               index === 2 ? <ShowChartIcon /> : <SettingsIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box component="header" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
          <IconButton onClick={toggleDrawer(true)} edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Crypto Dashboard
          </Typography>
          <Box>
            <IconButton color="inherit" sx={{ mr: 2 }}>
              <NotificationsIcon />
              {notifications.filter(n => !n.read).length > 0 && (
                <Chip
                  label={notifications.filter(n => !n.read).length}
                  color="error"
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                />
              )}
            </IconButton>
            <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} color="inherit">
              {mode === 'dark' ? '🌞' : '🌙'}
            </IconButton>
          </Box>
        </Box>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          {drawerContent}
        </Drawer>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <PortfolioCard portfolio={portfolio} transactions={transactions} />
          </Grid>
          <Grid item xs={12} md={8}>
            <PortfolioPerformanceChart 
              portfolio={portfolio}
              transactions={transactions}
              theme={theme}
              mode={mode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CryptoDistributionChart portfolio={portfolio} />
          </Grid>
          <Grid item xs={12}>
              <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={3}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error" align="center">{error}</Typography>
                ) : (
                  <Table sx={{ minWidth: 650 }} aria-label="crypto holdings table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Average Buy Price</TableCell>
                        <TableCell align="right">Current Price</TableCell>
                        <TableCell align="right">Current Value</TableCell>
                        <TableCell align="right">24h Change</TableCell>
                        <TableCell align="right">Profit/Loss</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {portfolio.map((item) => (
                        <TableRow key={item.cryptocurrencyId} hover>
                          <TableCell component="th" scope="row">
                            {item.coinData ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <img src={item.coinData.image} alt={item.coinData.name} style={{ width: 24, height: 24, marginRight: 8 }} />
                                {item.coinData.name} ({item.coinData.symbol.toUpperCase()})
                              </Box>
                            ) : item.cryptocurrencyId}
                          </TableCell>
                          <TableCell align="right">{item.amount.toFixed(8)}</TableCell>
                          <TableCell align="right">${item.averageBuyPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">${item.coinData?.current_price.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell align="right">
                            ${item.coinData ? (item.amount * item.coinData.current_price).toFixed(2) : 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {item.coinData && (
                              <Chip
                                icon={item.coinData.price_change_percentage_24h > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                label={`${item.coinData.price_change_percentage_24h.toFixed(2)}%`}
                                color={item.coinData.price_change_percentage_24h > 0 ? 'success' : 'error'}
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {item.coinData && (
                              <Chip
                                icon={item.coinData.current_price > item.averageBuyPrice ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                label={`${((item.coinData.current_price - item.averageBuyPrice) / item.averageBuyPrice * 100).toFixed(2)}%`}
                                color={item.coinData.current_price > item.averageBuyPrice ? 'success' : 'error'}
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Button onClick={() => handleTransactionClick(item.cryptocurrencyId, 'buy')} startIcon={<AddIcon />} variant="contained" size="small" sx={{ mr: 1 }}>
                              Buy
                            </Button>
                            <Button onClick={() => handleTransactionClick(item.cryptocurrencyId, 'sell')} startIcon={<RemoveIcon />} variant="outlined" size="small">
                              Sell
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <AddTransactionFab />
      </Box>
    </ThemeProvider>
  );
};

export default DashboardPage;