import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Avatar, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fetchCryptoList } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CryptoList = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const handleRowClick = (id: number) => {
        navigate(`/crypto/${id}`);
    };

    useEffect(() => {
        const fetchCryptos = async () => {
            try {
                const data = await fetchCryptoList();
                setCryptocurrencies(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cryptocurrencies:', error);
                setLoading(false);
            }
        };
        fetchCryptos();
    }, []);

    const formatPercentage = (value: number | null) => {
        if (value !== null) {
            const formattedValue = `${value.toFixed(2)}%`;
            let color = 'inherit'; // Default color

            if (value < 0) {
                color = '#ef5350'; // Light red for negative values
            } else if (value > 0) {
                color = '#66bb6a'; // Light green for positive values
            }

            return <span style={{ color }}>{formattedValue}</span>;
        } else {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
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
            <Typography variant="h3" component="h3" align="center" gutterBottom>
                Featured Cryptocurrencies
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Symbol</TableCell>
                            <TableCell>Current Price</TableCell>
                            <TableCell>1h</TableCell>
                            <TableCell>24h</TableCell>
                            <TableCell>7d</TableCell>
                            <TableCell>Market Cap</TableCell>
                            <TableCell>Volume (24h)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cryptocurrencies.map((crypto) => (
                            <TableRow key={crypto.id} hover onClick={() => handleRowClick(crypto.id)} style={{ cursor: "pointer" }}>
                                <TableCell>
                                    <Avatar alt={crypto.name} src={crypto.image} sx={{ width: 50, height: 50 }} />
                                </TableCell>
                                <TableCell>
                                    {crypto.name}
                                </TableCell>
                                <TableCell>{crypto.symbol.toUpperCase()}</TableCell>
                                <TableCell>{crypto.current_price.toFixed(2)} $</TableCell>
                                <TableCell>{formatPercentage(crypto.price_change_percentage_1h_in_currency)}</TableCell>
                                <TableCell>{formatPercentage(crypto.price_change_percentage_24h_in_currency)}</TableCell>
                                <TableCell>{formatPercentage(crypto.price_change_percentage_7d_in_currency)}</TableCell>
                                <TableCell>{crypto.market_cap.toLocaleString()} $</TableCell>
                                <TableCell>{crypto.total_volume.toLocaleString()} $</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CryptoList;