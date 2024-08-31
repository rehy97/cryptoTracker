import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, Alert, MenuItem, Autocomplete } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchCryptoList } from '../utils/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface CreateTransactionPageProps {
    type: string | null;
    cryptocurrencyId: string | null;
}

interface Cryptocurrency {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
}

const CreateTransactionPage: React.FC<CreateTransactionPageProps> = ({ type, cryptocurrencyId }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        cryptocurrencyId: cryptocurrencyId,
        date: '',
        type: type,
        amount: '',
        unitPrice: '',
    });

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

    const fetchCryptoPrice = (cryptoId: string) => {
        const crypto = cryptocurrencies.find((crypto) => crypto.id === cryptoId);
        return crypto ? crypto.current_price : 0;
    };

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

        console.log(formData);

        try {
            const response = await axios.post('http://localhost:5221/api/Portfolio/add-transaction', formData);
            navigate(`/dashboard`); // Redirect to transaction details page on successful creation
        } catch (error) {
            console.error('Error creating transaction:', error);
            setError('Failed to create transaction. Please try again.'); // Display error message on failure
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
                    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
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
                        Create Transaction
                    </Typography>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Autocomplete
                            options={cryptocurrencies}
                            getOptionLabel={(option) => option.name}
                            fullWidth
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
                            value={formData.date ? dayjs(formData.date) : null}
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
                            Create Transaction
                        </Button>
                    </Box>
                </Container>
            </Box>
        </LocalizationProvider>
    );
};

export default CreateTransactionPage;
