import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar, CircularProgress, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import axios from 'axios';

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

interface TopMoversCardProps {
  title: string;
  type: 'gainers' | 'losers';
}

const timeFrames = ['1H' ,'24H', '7D', '30D', '1Y'];

const TopMoversCard: React.FC<TopMoversCardProps> = ({ title, type }) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24H');
  const [allCoins, setAllCoins] = useState<CoinData[]>([]);
  const [displayedCoins, setDisplayedCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPriceChangePercentage = (coin: CoinData, tf: string) => {
    switch (tf) {
      case '1H':
        return coin.price_change_percentage_1h_in_currency;
      case '24H':
        return coin.price_change_percentage_24h_in_currency
      case '7D':
        return coin.price_change_percentage_7d_in_currency;
      case '30D':
        return coin.price_change_percentage_30d_in_currency;
      case '1Y':
        return coin.price_change_percentage_1y_in_currency;
      default:
        return coin.price_change_percentage_24h_in_currency;
    }
  };

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<CoinData[]>('http://localhost:5221/api/Coin/list');
      console.log(response.data);
      setAllCoins(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch market data', err);
      setError('Failed to fetch market data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    if (allCoins.length > 0) {
      const sortedCoins = allCoins
        .filter(coin => getPriceChangePercentage(coin, selectedTimeFrame) !== undefined)
        .sort((a, b) => 
          getPriceChangePercentage(b, selectedTimeFrame) - getPriceChangePercentage(a, selectedTimeFrame)
        );
      
      if (type === 'gainers') {
        console.log(sortedCoins.slice(0, 5));
        console.log(selectedTimeFrame);
        setDisplayedCoins(sortedCoins.slice(0, 5));
      } else {
        setDisplayedCoins(sortedCoins.slice(-5).reverse());
      }
    }
  }, [allCoins, selectedTimeFrame, type]);

  const handleTimeFrameChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeFrame: string | null
  ) => {
    if (newTimeFrame !== null) {
      setSelectedTimeFrame(newTimeFrame);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{title}</Typography>
          <ToggleButtonGroup
            size="small"
            value={selectedTimeFrame}
            exclusive
            onChange={handleTimeFrameChange}
            aria-label="time frame selection"
          >
            {timeFrames.map((tf) => (
              <ToggleButton key={tf} value={tf} aria-label={tf}>
                {tf}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <List>
            {displayedCoins.map((coin) => {
              const priceChange = getPriceChangePercentage(coin, selectedTimeFrame);
              return (
                <ListItem key={coin.id}>
                  <ListItemIcon>
                    <Avatar src={coin.image} alt={coin.name} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${coin.name} (${coin.symbol.toUpperCase()})`}
                    secondary={priceChange !== undefined ? `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%` : 'N/A'}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default TopMoversCard;