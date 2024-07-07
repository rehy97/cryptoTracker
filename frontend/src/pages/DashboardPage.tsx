import React, { useState } from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const DashboardPage = () => {
  const [cryptos, setCryptos] = useState([
    { id: 1, name: 'Bitcoin', amount: 2, valueUsd: 60000 },
    { id: 2, name: 'Ethereum', amount: 10, valueUsd: 40000 },
    { id: 3, name: 'Litecoin', amount: 20, valueUsd: 8000 },
    { id: 4, name: 'Ripple', amount: 100, valueUsd: 3000 },
  ]);

  const [historicalData, setHistoricalData] = useState([
    { date: '2023-01-01', value: 1000 },
    { date: '2023-01-02', value: 1500 },
    { date: '2023-01-03', value: 2000 },
    { date: '2023-01-04', value: 2500 },
    { date: '2023-01-05', value: 3000 },
    { date: '2023-01-06', value: 3500 },
    { date: '2023-01-07', value: 4000 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const pieData = cryptos.map(crypto => ({
    name: crypto.name,
    value: crypto.amount,
  }));

  return (
    <Box sx={{ display: 'flex' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
            Dashboard
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={historicalData}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
          <Paper sx={{ width: '100%', overflow: 'hidden', mt: 4 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Value (USD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cryptos.map((crypto) => (
                  <TableRow key={crypto.id}>
                    <TableCell component="th" scope="row">
                      {crypto.name}
                    </TableCell>
                    <TableCell align="right">{crypto.amount}</TableCell>
                    <TableCell align="right">{crypto.valueUsd}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
