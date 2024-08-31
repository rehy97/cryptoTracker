import React, { useState, useMemo } from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Chip, Tooltip } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

const timePeriods = ['24h', '7d', '1m', '3m', '1y', 'all'] as const;
type TimePeriod = typeof timePeriods[number];

const timePeriodLabels: Record<TimePeriod, string> = {
  '24h': '24H',
  '7d': '7D',
  '1m': '1M',
  '3m': '3M',
  '1y': '1Y',
  'all': 'All',
};

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
  type: 'buy' | 'sell';
  unitPrice: number;
  totalPrice: number;
}

interface PortfolioPerformanceChartProps {
  portfolio: PortfolioItem[];
  transactions: Transaction[];
  theme: any;
  mode: 'light' | 'dark';
}

interface PerformanceDataPoint {
  date: string;
  value: number;
}

interface PerformanceData {
  '24h': PerformanceDataPoint[];
  '7d': PerformanceDataPoint[];
  '1m': PerformanceDataPoint[];
  '3m': PerformanceDataPoint[];
  '1y': PerformanceDataPoint[];
  'all': PerformanceDataPoint[];
}

const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({ portfolio, transactions, theme, mode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1m');

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: TimePeriod | null) => {
    if (newPeriod !== null) {
      setSelectedPeriod(newPeriod);
    }
  };

  const performanceData = useMemo<PerformanceData>(() => {
    if (portfolio.length === 0 || transactions.length === 0) {
      return {
        '24h': [] ,'7d': [], '1m': [], '3m': [], '1y': [], 'all': []
      };
    }

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const earliestDate = new Date(sortedTransactions[0]?.date || new Date());
    const latestDate = new Date();

    const getDatesBetween = (start: Date, end: Date, interval: number) => {
      const dates = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + interval);
      }
      return dates;
    };

    const calculatePortfolioValueAtDate = (date: Date) => {
      const relevantTransactions = sortedTransactions.filter(t => new Date(t.date) <= date);
      const holdings = {} as { [key: string]: number };

      relevantTransactions.forEach(t => {
        if (!holdings[t.cryptocurrencyId]) holdings[t.cryptocurrencyId] = 0;
        holdings[t.cryptocurrencyId] += t.type === 'buy' ? t.amount : -t.amount;
      });

      return Object.entries(holdings).reduce((total, [cryptoId, amount]) => {
        const coin = portfolio.find(p => p.cryptocurrencyId === cryptoId);
        // Use the current price from coinData if available, otherwise fall back to the currentPrice field
        const price = coin?.coinData?.current_price ?? coin?.currentPrice ?? 0;
        return total + (amount * price);
      }, 0);
    };

    const generatePerformanceData = (start: Date, end: Date, interval: number) => {
      const dates = getDatesBetween(start, end, interval);
      return dates.map(date => ({
        date: date.toISOString(),
        value: calculatePortfolioValueAtDate(date)
      }));
    };

    const now = new Date();
    const result = {
      '24h': generatePerformanceData(new Date(now.getTime() - 24 * 60 * 60 * 1000), latestDate, 1),
      '7d': generatePerformanceData(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), latestDate, 1),
      '1m': generatePerformanceData(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), latestDate, 1),
      '3m': generatePerformanceData(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), latestDate, 3),
      '1y': generatePerformanceData(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), latestDate, 7),
      'all': generatePerformanceData(earliestDate, latestDate, 30),
    };

    return result;
  }, [portfolio, transactions]);

  const currentData = performanceData[selectedPeriod];

  const startValue = currentData[0]?.value ?? 0;
  const endValue = currentData[currentData.length - 1]?.value ?? 0;
  const changeValue = endValue - startValue;
  const changePercentage = startValue !== 0 ? ((endValue - startValue) / startValue) * 100 : 0;

  const chartOptions: ApexOptions = {
    colors: [theme.palette.primary.main],
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      type: 'datetime',
      categories: currentData.map(data => data.date),
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      title: {
        text: 'Portfolio Value (USD)',
        style: {
          color: theme.palette.text.primary,
        },
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
        formatter: (value) => `$${value.toFixed(2)}`
      },
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      },
      theme: mode,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      },
      colors: [theme.palette.primary.main],
    },
    theme: {
      mode: mode
    },
  };

  const series = [
    {
      name: "Portfolio Value",
      data: currentData.map(data => ({ x: new Date(data.date).getTime(), y: data.value })),
    }
  ];

  return (
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Portfolio Performance</Typography>
          <ToggleButtonGroup
            value={selectedPeriod}
            exclusive
            onChange={handlePeriodChange}
            size="small"
          >
            {timePeriods.map((period) => (
              <ToggleButton key={period} value={period}>
                {timePeriodLabels[period]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Value change">
              <Chip
                icon={changeValue >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                label={`$${Math.abs(changeValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color={changeValue >= 0 ? 'success' : 'error'}
                variant="filled"
                size="small"
                sx={{ mr: 1 }}
              />
            </Tooltip>
            <Tooltip title="Percentage change">
              <Chip
                icon={<Percent size={16} />}
                label={`${changePercentage.toFixed(2)}%`}
                color={changePercentage >= 0 ? 'success' : 'error'}
                variant="filled"
                size="small"
              />
            </Tooltip>
          </Box>
        </Box>
        {currentData.length > 0 ? (
          <ReactApexChart 
            options={chartOptions}
            series={series}
            type="area"
            height={390}
          />
        ) : (
          <Typography variant="body1" align="center">No data available for the selected period.</Typography>
        )}
      </CardContent>
  );
};

export default PortfolioPerformanceChart;