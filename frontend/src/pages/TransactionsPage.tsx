import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate, Link  } from 'react-router-dom';

interface Transaction {
  id: number;
  cryptocurrencyId: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  unitPrice: number;
  totalPrice: number;
}

const TransactionsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:5221/api/Transaction');
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5221/api/Transaction/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error(`Error deleting transaction with id ${id}:`, error);
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
        Your Transactions
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Link to="/create" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary">
            Create New Transaction
          </Button>
        </Link>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cryptocurrency</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.cryptocurrencyId}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>${transaction.unitPrice.toFixed(2)}</TableCell>
                <TableCell>${transaction.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <button onClick={() => handleDelete(transaction.id)}>Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionsPage;