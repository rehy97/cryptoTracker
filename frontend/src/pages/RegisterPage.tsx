import React, { useState } from 'react';
import { Box, Typography, Container, Button, Alert, InputAdornment, IconButton, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormInput from '../components/FormInput';
import PasswordField from '../components/PasswordField';
import ValidationMessages from '../components/ValidationMessages';
import useValidations from '../hooks/useValidations';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface PasswordValidations {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  match: boolean;
}

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
  const validations = useValidations(formData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validations.passwordMatch) {
      setError('Passwords do not match');
      return;
    }
    if (!validations.ageValid) {
      setError('You must be at least 18 years old to register');
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
    } catch (error: any) {
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
          <FormInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            validation={validations.username}
            required
          />
          <FormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            validation={validations.firstName}
            required
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            validation={validations.lastName}
            required
          />
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            validation={validations.email}
            required
          />
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            showPassword={showPassword}
            onChange={handleChange}
            onClickShowPassword={handleClickShowPassword}
            validations={{
              length: validations.passwordLength,
              uppercase: validations.passwordUppercase,
              number: validations.passwordNumber,
            }}
            required
          />
          <ValidationMessages 
          validations={{
              length: validations.passwordLength,
              uppercase: validations.passwordUppercase,
              number: validations.passwordNumber,
            }} />
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
                <>
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                  {validations.passwordMatch && (
                    <InputAdornment position="end">
                      <CheckCircleOutlineIcon color="success" />
                    </InputAdornment>
                  )}
                </>
              ),
            }}
          />
          <FormInput
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
          <Typography variant="caption" color={validations.ageValid ? 'success.main' : 'error.main'}>
            {validations.ageValid ? '✓' : '✕'} You must be at least 18 years old
          </Typography>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={
              !validations.username ||
              !validations.firstName ||
              !validations.lastName ||
              !validations.email ||
              !validations.passwordLength ||
              !validations.passwordUppercase ||
              !validations.passwordNumber ||
              !validations.passwordMatch ||
              !validations.ageValid
            }
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
