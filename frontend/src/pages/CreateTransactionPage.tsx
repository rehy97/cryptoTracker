import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, Alert, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchCryptoList } from '../utils/api';

interface CreateTransactionPageProps {
    type : string | null;
    cryptocurrencyId : string | null;
}

// Add CreateTransactionPageProps as a parameter to the functional component

const CreateTransactionPage: React.FC<CreateTransactionPageProps> = ({type, cryptocurrencyId}) => {
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
    const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([]);

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
        const crypto = cryptocurrencies.find((crypto: any) => crypto.id === cryptoId);
        return crypto ? crypto.current_price : 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
            unitPrice: name === 'cryptocurrencyId' ? fetchCryptoPrice(value) : prevData.unitPrice
        }));
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
        <Box
            sx={{
                pt: 8,
                pb: 6,
                backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
            }}
        >
            <Container maxWidth="sm">
                <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
                    Create Transaction
                </Typography>
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
                    }}
                    onSubmit={handleSubmit}
                >
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        variant="outlined"
                        fullWidth
                        select
                        label="Cryptocurrency"
                        name="cryptocurrencyId"
                        value={formData.cryptocurrencyId}
                        onChange={handleChange}
                        required
                    >
                        {cryptocurrencies.map((crypto: any) => (
                            <MenuItem key={crypto.id} value={crypto.id}>
                                {crypto.name} ({crypto.symbol.toUpperCase()})
                            </MenuItem>
                        ))}
                    </TextField>
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
                    <TextField
                        variant="outlined"
                        fullWidth
                        label="Date"
                        name="date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.date}
                        onChange={handleChange}
                        required
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
                        InputProps={{ readOnly: true }}
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
    );
};

export default CreateTransactionPage;