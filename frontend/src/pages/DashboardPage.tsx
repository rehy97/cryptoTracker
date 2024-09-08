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
import LogoutIcon from '@mui/icons-material/Logout';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'; // Add this line
import FileUploadIcon from '@mui/icons-material/FileUpload'; // Add this line
import { amber } from '@mui/material/colors';
import PortfolioCard from '../components/PortfolioCard';
import PortfolioPerformanceChart from '../components/PortfolioPerformanceGraph';
import CryptoDistributionChart from '../components/CryptoDistributionChart';
import AddTransactionFab from '../components/AddTransactionFab';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TopMoversCard from '../components/TopMoversCard';
import { useAuth } from '../context/useAuth';
import CSVImportModal from '../components/CSVImportModal';

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
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_1y_in_currency: number;
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
  const { user, logout} = useAuth();
  const [mode, setMode] = useState<PaletteMode>('dark');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24h');
  const [csvModalOpen, setCsvModalOpen] = useState(false);
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

  const handleCSVImport = (file : File) => {
    // Zde implementujte logiku pro zpracování CSV souboru
    console.log('Importing CSV file:', file.name);
    // TODO: Přidejte zde logiku pro parsování CSV a aktualizaci portfolia
    setCsvModalOpen(false);
  };

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

  const handleNavigation = (path : string) => {
    navigate(path);
    setDrawerOpen(false);
  };

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
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
          { text: 'Portfolio', icon: <AccountBalanceWalletIcon />, path: '/portfolio' },
          { text: 'Market', icon: <ShowChartIcon />, path: '/integration' },
          { text: 'Transactions', icon: <SwapHorizIcon />, path: '/transactions' },
          { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
        ].map((item) => (
          <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.username}
            </Typography>
            <IconButton onClick={() => setCsvModalOpen(true)} color="inherit" sx={{ mr: 2 }}>
              <FileUploadIcon />
            </IconButton>
            <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} color="inherit" sx={{ mr: 2 }}>
              {mode === 'dark' ? '🌞' : '🌙'}
            </IconButton>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LogoutIcon />}
              onClick={logout}
              size='small'
            >
              Logout
            </Button>
          </Box>
        </Box>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          {drawerContent}
        </Drawer>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Paper sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <PortfolioCard portfolio={portfolio} transactions={transactions} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <Paper sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <PortfolioPerformanceChart 
              portfolio={portfolio}
              transactions={transactions}
              theme={theme}
              mode={mode}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Paper sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CryptoDistributionChart portfolio={portfolio} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Paper sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <TopMoversCard 
              title="Top Gainers"
              type="gainers"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Paper sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <TopMoversCard 
              title="Top Losers"
              type="losers"
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                    <TableCell align="right">{item.amount.toFixed(16)}</TableCell>
                    <TableCell align="right">${item.averageBuyPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">${item.coinData?.current_price.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell align="right">
                      ${item.coinData ? (item.amount * item.coinData.current_price).toFixed(2) : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {item.coinData && (
                        <Chip
                          icon={item.coinData.price_change_percentage_24h_in_currency > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          label={`${item.coinData.price_change_percentage_24h_in_currency.toFixed(2)}%`}
                          color={item.coinData.price_change_percentage_24h_in_currency> 0 ? 'success' : 'error'}
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
        <CSVImportModal
          open={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          onImport={handleCSVImport}
        />
      </Box>
    </ThemeProvider>
  );
};

export default DashboardPage;