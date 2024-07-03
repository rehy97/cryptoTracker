import React, { useState } from 'react';
import { Box, Typography, Container, TextField, Button, Alert, IconButton, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5221/api/User/register', {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
      });
  
      if (response.status === 200) {
        setSuccess('Registration successful');
        navigate('/login');
      }
    } catch (error : any) {
      if (error.response && error.response.data && Array.isArray(error.response.data)) {
        const errorMessage = error.response.data.join('\n');
        setError(errorMessage);
      } else {
        setError('Registration failed');
        console.error('Error registering:', error);
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
          Register
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          Create your account to get started
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
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
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            required
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            required
            value={formData.lastName}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Email Address"
            name="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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
          <TextField
            variant="outlined"
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
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
          <TextField
            variant="outlined"
            fullWidth
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            InputLabelProps={{ shrink: true }}
            required
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          <Typography variant="body2" color="textSecondary" align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: theme.palette.primary.main }}>
              Login
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;