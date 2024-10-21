import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, Alert, MenuItem, Autocomplete } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchCryptoList } from '../utils/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface Transaction {
    id: number;
    cryptocurrencyId: string;
    date: string;
    type: 'buy' | 'sell';
    amount: number;
    unitPrice: string;
}

interface Cryptocurrency {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
}

const EditTransactionPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { transaction } = location.state as { transaction: Transaction };

    const [formData, setFormData] = useState<Transaction>(transaction);
    const [error, setError] = useState('');
    const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);

    useEffect(() => {
        const fetchCryptocurrencies = async () => {
            try {
                const data = await fetchCryptoList();
                setCryptocurrencies(data);
            } catch (error) {
                console.error('Error fetching cryptocurrencies:', error);
            }
        };

        fetchCryptocurrencies();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
    
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCryptoChange = (event: React.SyntheticEvent, value: Cryptocurrency | null) => {
        if (value) {
            setFormData((prevData) => ({
                ...prevData,
                cryptocurrencyId: value.id,
                unitPrice: value.current_price.toString()
            }));
        }
    };

    const handleDateChange = (date: Dayjs | null) => {
        if (date) {
            setFormData((prevData) => ({
                ...prevData,
                date: date.format('YYYY-MM-DD')
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const updatedTransaction = {
            cryptocurrencyId: formData.cryptocurrencyId,
            date: formData.date,
            type: formData.type,
            amount: parseFloat(formData.amount.toString()),
            unitPrice: parseFloat(formData.unitPrice.toString())
        };
    
        try {
            const response = await axios.put(
                `http://localhost:5221/api/Transaction/${formData.id}`,
                updatedTransaction
            );
            
            if (response.status === 200) {
                navigate('/transactions'); // Přesměrování na seznam transakcí po úspěšné aktualizaci
            } else {
                setError('Unexpected response from server');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server vrátil chybovou odpověď
                    setError(`Error: ${error.response.data}`);
                } else if (error.request) {
                    // Požadavek byl odeslán, ale nedošla žádná odpověď
                    setError('No response received from server');
                } else {
                    // Něco se pokazilo při nastavování požadavku
                    setError('Error setting up the request');
                }
            } else {
                setError('An unexpected error occurred');
            }
            console.error('Error updating transaction:', error);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    pt: 8,
                    pb: 6,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <Container maxWidth="sm">
                    <Box
                        component="form"
                        sx={{
                            borderRadius: '8px',
                            p: 3,
                            mt: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'}`,
                        }}
                        onSubmit={handleSubmit}
                    >
                    <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
                        Edit Transaction
                    </Typography>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Autocomplete
                            options={cryptocurrencies}
                            getOptionLabel={(option) => option.name}
                            fullWidth
                            value={cryptocurrencies.find(crypto => crypto.id === formData.cryptocurrencyId) || null}
                            renderInput={(params) => <TextField {...params} label="Cryptocurrency" variant="outlined" />}
                            renderOption={(props, option) => (
                                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                    <img
                                        loading="lazy"
                                        width="20"
                                        src={option.image}
                                        alt={option.name}
                                    />
                                    {option.name} ({option.symbol.toUpperCase()})
                                </Box>
                            )}
                            onChange={handleCryptoChange}
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                        <DatePicker
                            label="Date"
                            value={dayjs(formData.date)}
                            onChange={handleDateChange}
                            sx={{ width: "100%" }}
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            select
                            label="Type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="buy">buy</MenuItem>
                            <MenuItem value="sell">sell</MenuItem>
                        </TextField>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Unit Price"
                            name="unitPrice"
                            type="number"
                            value={formData.unitPrice}
                            onChange={handleChange}
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Update Transaction
                        </Button>
                    </Box>
                </Container>
            </Box>
        </LocalizationProvider>
    );
};

export default EditTransactionPage;