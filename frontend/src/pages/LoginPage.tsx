import React, { useState } from 'react';
import { Box, Typography, Container, TextField, Button, Alert, IconButton, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5221/api/User/login', {
        username: formData.username,
        password: formData.password,
      });
  
      if (response.status === 200) {
        navigate('/dashboard');
      }
    } catch (error : any) {
        if (error.response && error.response.data) {
            setError(error.response.data);
          } else {
            setError('Login failed');
            console.log(error.response.data);
          }
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
          Login
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          Sign in to your account
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box
          component="form"
          sx={{
            borderRadius: '8px',     // Rounded corners
            p: 3,                    // Padding
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
            required
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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