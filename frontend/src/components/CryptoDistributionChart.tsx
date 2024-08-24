import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  amount: number;
  valueUsd: number;
  change: number;
  icon: string;
  price: number;
  color: string;
}

interface CryptoDistributionChartProps {
  cryptos: CryptoData[];
}

const CryptoDistributionChart: React.FC<CryptoDistributionChartProps> = ({ cryptos }) => {
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

  const totalValue = cryptos.reduce((sum, crypto) => sum + crypto.valueUsd, 0);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Crypto Distribution</Typography>
        <Box sx={{ display: 'flex', height: 300 }}>
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={cryptos}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valueUsd"
                onMouseEnter={onPieEnter}
              >
                {cryptos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
              {cryptos.map((crypto, index) => (
                <ListItem 
                  key={crypto.id}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: activeIndex === index ? 'action.hover' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: crypto.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      {crypto.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        {crypto.name}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          ${crypto.valueUsd.toLocaleString()}
                        </Typography>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {`${(crypto.valueUsd / totalValue * 100).toFixed(2)}%`}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CryptoDistributionChart;