import React, { useState } from 'react';
import { Box, Typography, Container, TextField, Button, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginAPI } from '../utils/api';
import { useAuth } from '../context/useAuth';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!formData.username || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    loginUser(formData.username, formData.password);
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
          Login
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          Sign in to your account
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
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
          <TextField
            variant="outlined"
            fullWidth
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Password"
            name="password"
            type='password'
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
          <Typography variant="body2" color="textSecondary" align="center">
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: theme.palette.primary.main }}>
              Register
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
