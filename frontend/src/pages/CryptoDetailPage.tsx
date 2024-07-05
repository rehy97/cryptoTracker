import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid, Avatar } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

const CryptoDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const [crypto, setCrypto] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchCryptoDetail = async () => {
            try {
                const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
                setCrypto(response.data);

                const chartResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
                    params: {
                        vs_currency: 'usd',
                        days: 7
                    }
                });
                const formattedChartData = chartResponse.data.prices.map((price: any) => ({
                    date: new Date(price[0]).toLocaleDateString(),
                    price: price[1]
                }));
                setChartData(formattedChartData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cryptocurrency details:', error);
                setLoading(false);
            }
        };

        fetchCryptoDetail();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!crypto) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography variant="h6">Cryptocurrency not found</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                borderRadius: '8px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: 1,
                p: 2,
                mt: 2,
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar alt={crypto.name} src={crypto.image.large} sx={{ width: 50, height: 50, mr: 2 }} />
                        <Typography variant="h4" component="div">
                            {crypto.name} ({crypto.symbol.toUpperCase()})
                        </Typography>
                    </Box>
                    <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {crypto.market_data.current_price.usd.toLocaleString()} $
                    </Typography>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Market Cap:</span>
                            <span>{crypto.market_data.market_cap.usd.toLocaleString()} $</span>
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Fully Diluted Valuation:</span>
                            <span>{crypto.market_data.fully_diluted_valuation?.usd.toLocaleString() || 'N/A'} $</span>
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Volume (24h):</span>
                            <span>{crypto.market_data.total_volume.usd.toLocaleString()} $</span>
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Circulating Supply:</span>
                            <span>{crypto.market_data.circulating_supply.toLocaleString()}</span>
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Supply:</span>
                            <span>{crypto.market_data.total_supply?.toLocaleString() || 'N/A'}</span>
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Max Supply:</span>
                            <span>{crypto.market_data.max_supply?.toLocaleString() || 'N/A'}</span>
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Price Chart (Last 7 days)
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="price" stroke={theme.palette.primary.main} dot={false} strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CryptoDetail;