import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioItemWithCoinData {
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

interface CryptoDistributionChartProps {
  portfolio: PortfolioItemWithCoinData[];
}

const CryptoDistributionChart: React.FC<CryptoDistributionChartProps> = ({ portfolio }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const totalValue = portfolio.reduce((sum, item) => sum + (item.amount * (item.coinData?.current_price || 0)), 0);

  const colors = ['#F7931A', '#627EEA', '#BFBBBB', '#23292F', '#006AFF', '#2775CA', '#3C3C3D', '#26A17B'];

  return (
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>Crypto Distribution</Typography>
        <Box sx={{ display: 'flex', height: 300 }}>
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={portfolio}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey={(entry) => entry.amount * (entry.coinData?.current_price || 0)}
                onMouseEnter={onPieEnter}
              >
                {portfolio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <Box 
            sx={{ 
              width: '50%', 
              overflowY: 'auto', 
              maxHeight: 300,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.4)',
                },
              },
            }}
          >
            <List dense>
              {portfolio.map((item, index) => {
                const value = item.amount * (item.coinData?.current_price || 0);
                return (
                  <ListItem 
                    key={item.cryptocurrencyId}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: activeIndex === index ? 'action.hover' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      {item.coinData?.image && (
                        <img src={item.coinData.image} alt={item.coinData.name} style={{ width: 24, height: 24 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">
                          {item.coinData?.name || item.cryptocurrencyId}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {`${(value / totalValue * 100).toFixed(2)}%`}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>
      </CardContent>
  );
};

export default CryptoDistributionChart;