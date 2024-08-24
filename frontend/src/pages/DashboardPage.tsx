import React, { useCallback, useState } from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid, Card, CardContent, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme, ThemeProvider, createTheme, CssBaseline, Button, Chip, Avatar, LinearProgress, Select, MenuItem, FormControl, InputLabel, TextField, Tab, Tabs, PaletteMode, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { amber } from '@mui/material/colors';
import PortfolioCard from '../components/PortfolioCard';
import PortfolioPerformanceChart from '../components/PortfolioPerformanceGraph';
import CryptoDistributionChart from '../components/CryptoDistributionChart';
import AddTransactionFab from '../components/AddTransactionFab';

const DashboardPage = () => {
  const [mode, setMode] = useState<PaletteMode>('dark');
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: amber[500] },
      secondary: { main: '#f50057' },
    },
  }), [mode]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

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
            <PortfolioCard portfolioData={portfolioData} />
          </Grid>
          <Grid item xs={12} md={8}>
            <PortfolioPerformanceChart 
              performanceData={performanceData}
              theme={theme}
              mode={mode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CryptoDistributionChart cryptos={cryptos} />
          </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ width: '100%', overflow: 'hidden' }} elevation={3}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} centered>
                  <Tab label="Holdings" />
                  <Tab label="Transactions" />
                </Tabs>
                {selectedTab === 0 && (
                  <Table sx={{ minWidth: 650 }} aria-label="crypto holdings table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Value (USD)</TableCell>
                        <TableCell align="right">24h Change</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cryptos.map((crypto) => (
                        <TableRow key={crypto.id} hover>
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: crypto.color }}>{crypto.icon}</Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{crypto.name}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>({crypto.symbol})</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{crypto.amount}</TableCell>
                          <TableCell align="right">${crypto.valueUsd.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Chip
                              icon={crypto.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              label={`${crypto.change}%`}
                              color={crypto.change >= 0 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ mr: 1 }}>
                              Buy
                            </Button>
                            <Button startIcon={<RemoveIcon />} variant="outlined" size="small">
                              Sell
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {selectedTab === 1 && (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Recent Transactions</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><AddIcon color="success" /></ListItemIcon>
                        <ListItemText 
                          primary={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Bought 0.1 BTC</Typography>} 
                          secondary="2023-08-24 14:30" 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>$3,000</Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><RemoveIcon color="error" /></ListItemIcon>
                        <ListItemText 
                          primary={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Sold 5 ETH</Typography>} 
                          secondary="2023-08-23 09:15" 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>$10,000</Typography>
                      </ListItem>
                    </List>
                  </Box>
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