import React, { useState } from 'react';
import { Box, Typography, Container, TextField, Button, Alert, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';

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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '16px',
            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'}`,
          }}
        >
          <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
            Login
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" paragraph>
            Sign in to your account
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <Box
            component="form"
            sx={{
              width: '100%',
              mt: 1,
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
            
            <Divider sx={{ width: '100%', my: 2 }}>or</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ mb: 1, color: 'text.primary', borderColor: 'divider' }}
            >
              Continue with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AppleIcon />}
              sx={{ mb: 2, color: 'text.primary', borderColor: 'divider' }}
            >
              Continue with Apple
            </Button>
            
            <Typography variant="body2" color="textSecondary" align="center">
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: theme.palette.primary.main }}>
                Register
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;