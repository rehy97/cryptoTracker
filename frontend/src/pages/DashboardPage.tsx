import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid, Card, CardContent, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme, ThemeProvider, createTheme, CssBaseline, Button, Chip, Avatar, LinearProgress, Select, MenuItem, FormControl, InputLabel, TextField, Tab, Tabs, PaletteMode, ToggleButton, ToggleButtonGroup, CircularProgress, Menu, Tooltip } from '@mui/material';
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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';import FileUploadIcon from '@mui/icons-material/FileUpload';import { amber } from '@mui/material/colors';
import PortfolioCard from '../components/PortfolioCard';
import PortfolioPerformanceChart from '../components/PortfolioPerformanceGraph';
import CryptoDistributionChart from '../components/CryptoDistributionChart';
import AddTransactionFab from '../components/AddTransactionFab';
import axios from 'axios';
import Header from '../components/Header';
import AppDrawer from '../components/AppDrawer';
import { useNavigate } from 'react-router-dom';
import TopMoversCard from '../components/TopMoversCard';
import { useAuth } from '../context/useAuth';
import CSVImportModal from '../components/CSVImportModal';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
interface PortfolioItem {
  cryptocurrencyId: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
}
interface DashboardComponent {
  id: string;
  name: string;
  enabled: boolean;
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

const defaultComponents: DashboardComponent[] = [
  { id: 'portfolio-card', name: 'Portfolio Overview', enabled: true },
  { id: 'portfolio-performance', name: 'Portfolio Performance', enabled: true },
  { id: 'crypto-distribution', name: 'Crypto Distribution', enabled: true },
  { id: 'top-gainers', name: 'Top Gainers', enabled: true },
  { id: 'top-losers', name: 'Top Losers', enabled: true },
  { id: 'holdings-table', name: 'Holdings Table', enabled: true },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [dashboardSettings, setDashboardSettings] = useState<DashboardComponent[]>([]);
  const [mode, setMode] = useState<PaletteMode>('dark');
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: amber[500] },
      secondary: { main: '#f50057' },
    },
  }), [mode]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItemWithCoinData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setDashboardSettings((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('dashboardSettings', JSON.stringify(newOrder));
        return newOrder;
      });
    }

    setActiveId(null);
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
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      setDashboardSettings(JSON.parse(savedSettings));
    } else {
      setDashboardSettings(defaultComponents);
    }
    fetchPortfolioData();
    fetchTransactions();
  }, [fetchPortfolioData, fetchTransactions]);

  const getGridSize = (componentId: string): { xs: number, md: number } => {
    switch (componentId) {
      case 'portfolio-card':
        return { xs: 12, md: 4 };
      case 'portfolio-performance':
        return { xs: 12, md: 8 };
      case 'crypto-distribution':
      case 'top-gainers':
      case 'top-losers':
        return { xs: 12, md: 4 };
      case 'holdings-table':
        return { xs: 12, md: 12 };
      default:
        return { xs: 12, md: 4 };
    }
  };

  const SortableItem = ({ component, children }: { component: DashboardComponent; children: React.ReactNode }) => {
    const { xs, md } = getGridSize(component.id);
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: component.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Grid item xs={xs} md={md} ref={setNodeRef} style={style} {...attributes}>
        <Paper sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative',
          visibility: isDragging ? 'hidden' : 'visible',
        }}>
          <Box
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              zIndex: 1,
              cursor: 'move',
            }}
            {...listeners}
          >
            <Tooltip title="Drag to reorder">
              <IconButton size="small">
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {children}
        </Paper>
      </Grid>
    );
  };

  const renderDashboardComponent = (component: DashboardComponent) => {
    const content = (() => {
      switch (component.id) {
        case 'portfolio-card':
          return <PortfolioCard portfolio={portfolio} transactions={transactions} />;
        case 'portfolio-performance':
          return (
            <PortfolioPerformanceChart 
              portfolio={portfolio}
              transactions={transactions}
              theme={theme}
              mode={mode}
            />
          );
        case 'crypto-distribution':
          return <CryptoDistributionChart portfolio={portfolio} />;
        case 'top-gainers':
          return (
            <TopMoversCard 
              title="Top Gainers"
              type="gainers"
            />
          );
        case 'top-losers':
          return (
            <TopMoversCard 
              title="Top Losers"
              type="losers"
            />
          );
      case 'holdings-table':
        return (
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
                                sx={{ mr: 1 }}
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
        );
      default:
        return null;
      }
    })();

    return (
      <SortableItem key={component.id} component={component}>
        {content}
      </SortableItem>
    );
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

  const getUserInitials = (username : string) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  const handleClick = (event : any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleModeChange = (newMode: PaletteMode) => {
    setMode(newMode);
  };

  const handleCSVImport = () => {
    setCsvModalOpen(true);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
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
        <Header 
          onDrawerToggle={handleDrawerToggle}
          onModeChange={handleModeChange}
          onCSVImport={handleCSVImport}
          onLogout={logout}
          username={user?.username || ''}
          mode={mode}
        />
        <AppDrawer 
          open={drawerOpen}
          onClose={handleDrawerToggle}
          onNavigate={handleNavigation}
        />

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dashboardSettings.filter(component => component.enabled).map(component => component.id)}
            >
              <Grid container spacing={3} sx={{ height: '100%' }}>
                {dashboardSettings
                  .filter(component => component.enabled)
                  .map((component) => renderDashboardComponent(component))}
              </Grid>
            </SortableContext>
            <DragOverlay>
              {activeId ? renderDashboardComponent(dashboardSettings.find(c => c.id === activeId)!) : null}
            </DragOverlay>
          </DndContext>
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