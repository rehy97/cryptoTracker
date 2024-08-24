import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, Divider, ToggleButtonGroup, ToggleButton, LinearProgress, Tooltip } from '@mui/material';
import { TrendingUpIcon, TrendingDownIcon, AlertCircleIcon, PieChartIcon, BarChartIcon, DollarSignIcon } from 'lucide-react';

const timePeriods = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '1y', label: '1Y' },
];

interface PortfolioCardProps {
  portfolioData: {
    changes: {
      [key: string]: number;
    };
    totalValue: number;
    profitPercentage: number;
    estimatedAnnualReturn: number;
    realizedProfit: number;
    marketSentiment: string;
    alert: string;
  };
}

const PortfolioCard = ({ portfolioData }: PortfolioCardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
    if (newPeriod !== null) {
      setSelectedPeriod(newPeriod);
    }
  };

  const getCurrentChange = () => {
    return portfolioData.changes[selectedPeriod];
  };

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          Total Portfolio Value
        </Typography>
        <Typography variant="h3" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
          ${portfolioData.totalValue.toLocaleString()}
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
            icon={getCurrentChange() >= 0 ? <TrendingUpIcon size={16} /> : <TrendingDownIcon size={16} />}
            label={`${getCurrentChange()}%`}
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
          <Tooltip title="Percentage of portfolio that is profit">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <PieChartIcon size={16} style={{ marginRight: '8px' }} /> Profit %:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {portfolioData.profitPercentage}%
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Tooltip title="Estimated annual return based on current performance">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <BarChartIcon size={16} style={{ marginRight: '8px' }} /> Est. Annual Return:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {portfolioData.estimatedAnnualReturn}%
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Tooltip title="Total realized profit from sold assets">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <DollarSignIcon size={16} style={{ marginRight: '8px' }} /> Realized Profit:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${portfolioData.realizedProfit.toLocaleString()}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Market Sentiment
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Overall:</Typography>
          <Chip label={portfolioData.marketSentiment} color="primary" size="small" />
        </Box>
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