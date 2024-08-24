import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Chip, Tooltip } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon, PercentIcon } from 'lucide-react';

const timePeriods = [
  { value: '7d', label: '7D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
];

interface PerformanceData {
  date: string;
  value: number;
}

interface PortfolioPerformanceChartProps {
  performanceData: {
    [key: string]: PerformanceData[];
  };
  theme: any;
  mode: 'light' | 'dark';
}

const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({ performanceData, theme, mode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1m');

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string | null) => {
    if (newPeriod !== null) {
      setSelectedPeriod(newPeriod);
    }
  };

  const currentData = performanceData[selectedPeriod];
  const startValue = currentData[0].value;
  const endValue = currentData[currentData.length - 1].value;
  const changeValue = endValue - startValue;
  const changePercentage = ((endValue - startValue) / startValue) * 100;

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
    }
  };

  const series = [
    {
      name: "Portfolio Value",
      data: currentData.map(data => data.value),
    }
  ];

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Portfolio Performance</Typography>
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
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Current portfolio value">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DollarSignIcon size={20} style={{ marginRight: '8px' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                ${endValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Value change">
              <Chip
                icon={changeValue >= 0 ? <TrendingUpIcon size={16} /> : <TrendingDownIcon size={16} />}
                label={`$${Math.abs(changeValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color={changeValue >= 0 ? 'success' : 'error'}
                variant="filled"
                size="small"
                sx={{ mr: 1 }}
              />
            </Tooltip>
            <Tooltip title="Percentage change">
              <Chip
                icon={<PercentIcon size={16} />}
                label={`${changePercentage.toFixed(2)}%`}
                color={changePercentage >= 0 ? 'success' : 'error'}
                variant="filled"
                size="small"
              />
            </Tooltip>
          </Box>
        </Box>
        <ReactApexChart 
          options={chartOptions}
          series={series}
          type="area"
          height={350}
        />
      </CardContent>
    </Card>
  );
};

export default PortfolioPerformanceChart;