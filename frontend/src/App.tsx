import React, {useState, useEffect} from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import axios from 'axios';

/*
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "image": "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
    "current_price": 67793,
    "market_cap": 1336495629210,
    "market_cap_rank": 1,
    "total_volume": 22710279657,
    "high_24h": 67996,
    "low_24h": 66208,
    "price_change_24h": 654.84,
    "price_change_percentage_24h": 0.97536,
    "market_cap_change_24h": 19049322989,
    "market_cap_change_percentage_24h": 1.44593,
    "circulating_supply": 19711278,
    "total_supply": 21000000,
    "max_supply": 21000000,
    "ath": 73738,
    "ath_change_percentage": -8.10833,
    "ath_date": "2024-03-14T07:10:36.635Z",
    "atl": 67.81,
    "atl_change_percentage": 99826.29214,
    "atl_date": "2013-07-06T00:00:00Z",
    "roi": null,
    "last_updated": "2024-06-12T12:14:44.326Z",
    "price_change_percentage_1h_in_currency": -0.127948362719362,
    "price_change_percentage_24h_in_currency": 0.975364000659006,
    "price_change_percentage_7d_in_currency": -4.30333256285588
  },
*/

type CryptoCurrency = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
};

const App: React.FC = () => {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5221/api/Coin/list?currency=czk');
      setCryptos(response.data);
    }
    catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      {cryptos.map((crypto) => (
        <Box key={crypto.id}>
          <img src={crypto.image} alt={crypto.name} />
          <Box>
            <h2>{crypto.name} ({crypto.symbol.toUpperCase()})</h2>
            <p>Price: ${crypto.current_price}</p>
            <p>Market Cap: ${crypto.market_cap}</p>
            <p>Price Change (24h): {crypto.price_change_percentage_24h}%</p>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default App;