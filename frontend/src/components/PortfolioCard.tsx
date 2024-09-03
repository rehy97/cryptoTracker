import React, { useState, useMemo, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Divider, ToggleButtonGroup, ToggleButton, Tooltip, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, PieChart, BarChart, DollarSign } from 'lucide-react';
import axios from 'axios';

const timePeriods = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '1y', label: '1Y' },
];

interface PortfolioItem {
  cryptocurrencyId: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
  coinData?: {
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
  };
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

interface PortfolioCardProps {
  portfolio: PortfolioItem[];
  transactions: Transaction[];
}

interface FearAndGreedData {
  name: string;
  data: {
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update: string;
  }[];
  metadata: {
    error: string | null;
  };
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, transactions }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [fearAndGreedIndex, setFearAndGreedIndex] = useState<FearAndGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFearAndGreedIndex = async () => {
      try {
        setLoading(true);
        const response = await axios.get<FearAndGreedData>('http://localhost:5221/api/FearAndGreedIndex');
        console.log(response.data);
        setFearAndGreedIndex(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch Fear and Greed Index', err);
        setError('Failed to fetch market sentiment data');
        setLoading(false);
      }
    };

    fetchFearAndGreedIndex();
  }, []);

  const getFearAndGreedColor = (value: number) => {
    if (value <= 20) return 'error';
    if (value <= 40) return 'warning';
    if (value <= 60) return 'info';
    if (value <= 80) return 'success';
    return 'success';
  };

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string | null) => {
    if (newPeriod !== null) {
      setSelectedPeriod(newPeriod);
    }
  };

  const portfolioMetrics = useMemo(() => {
    const totalValue = portfolio.reduce((sum, item) => sum + (item.amount * (item.coinData?.current_price || 0)), 0);
    const totalCost = portfolio.reduce((sum, item) => sum + (item.amount * item.averageBuyPrice), 0);
    const unrealizedProfit = totalValue - totalCost;
    const profitPercentage = (unrealizedProfit / totalCost) * 100;

    const realizedProfit = transactions.reduce((sum, transaction) => {
      if (transaction.type === 'sell') {
        const buyPrice = portfolio.find(item => item.cryptocurrencyId === transaction.cryptocurrencyId)?.averageBuyPrice || 0;
        return sum + (transaction.unitPrice - buyPrice) * transaction.amount;
      }
      return sum;
    }, 0);

    const totalProfit = unrealizedProfit + realizedProfit;
    const totalInvestment = transactions.reduce((sum, transaction) => {
      return transaction.type === 'buy' ? sum + transaction.totalPrice : sum;
    }, 0);

    const roi = (totalProfit / totalInvestment) * 100;

    return {
      totalValue,
      unrealizedProfit,
      realizedProfit,
      profitPercentage,
      roi,
      totalProfit
    };
  }, [portfolio, transactions]);

  const getCurrentChange = () => {
    const totalValue = portfolio.reduce((sum, item) => sum + (item.amount * (item.coinData?.current_price || 0)), 0);
    const weightedChange = portfolio.reduce((sum, item) => {
      const itemValue = item.amount * (item.coinData?.current_price || 0);
      const itemWeight = itemValue / totalValue;
      return sum + (itemWeight * (item.coinData?.price_change_percentage_24h_in_currency || 0));
    }, 0);
    return weightedChange;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2, overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Total Portfolio Value
        </Typography>
        <Typography variant="h3" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
          ${portfolioMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <ToggleButtonGroup
            value={selectedPeriod}
            exclusive
            onChange={handlePeriodChange}
            size="small"
          >
            {timePeriods.map((period) => (
              <ToggleButton key={period.value} value={period.value}>
                {period.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Chip
            icon={getCurrentChange() >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            label={`${getCurrentChange().toFixed(2)}%`}
            color={getCurrentChange() >= 0 ? 'success' : 'error'}
            variant="filled"
            size="small"
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Portfolio Metrics
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Tooltip title="Total profit percentage (including realized and unrealized)">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <PieChart size={16} style={{ marginRight: '8px' }} /> Total Profit %:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {portfolioMetrics.profitPercentage.toFixed(2)}%
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Tooltip title="Return on Investment (ROI)">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <BarChart size={16} style={{ marginRight: '8px' }} /> ROI:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {portfolioMetrics.roi.toFixed(2)}%
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Tooltip title="Total realized profit from sold assets">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <DollarSign size={16} style={{ marginRight: '8px' }} /> Realized Profit/Loss:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${portfolioMetrics.realizedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Tooltip title="Unrealized profit (paper gains)">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <DollarSign size={16} style={{ marginRight: '8px' }} /> Unrealized Profit/Loss:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${portfolioMetrics.unrealizedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Market Sentiment
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body2">{error}</Typography>
        ) : fearAndGreedIndex && fearAndGreedIndex.data.length > 0 ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fear & Greed Index:</Typography>
              <Tooltip title={`Updated: ${new Date(parseInt(fearAndGreedIndex.data[0].timestamp) * 1000).toLocaleString()}`}>
                <Chip 
                  label={`${fearAndGreedIndex.data[0].value} - ${fearAndGreedIndex.data[0].value_classification}`} 
                  color={getFearAndGreedColor(parseInt(fearAndGreedIndex.data[0].value))}
                  size="small" 
                />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Portfolio Trend:</Typography>
              <Chip 
                icon={getCurrentChange() >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                label={getCurrentChange() >= 0 ? 'Bullish' : 'Bearish'} 
                color={getCurrentChange() >= 0 ? 'success' : 'error'}
                size="small" 
              />
            </Box>
          </>
        ) : null}
      </CardContent>
      <Box sx={{ p: 2, bgcolor: 'background.default', mt: 'auto' }}>
        <Button variant="contained" fullWidth sx={{ borderRadius: 2, textTransform: 'none' }}>
          View Detailed Analytics
        </Button>
      </Box>
    </Card>
  );
};

export default PortfolioCard;