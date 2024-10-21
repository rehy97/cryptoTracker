import React, { useState } from 'react';
import { Box, Typography, Container, Button, Alert, InputAdornment, IconButton, TextField, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import PasswordField from '../components/PasswordField';
import ValidationMessages from '../components/ValidationMessages';
import useValidations from '../hooks/useValidations';
import { Visibility, VisibilityOff, Google, Apple } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/useAuth';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const { registerUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: null as Dayjs | null,
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

  const handleDateChange = (date: Dayjs | null) => {
    setFormData({
      ...formData,
      dateOfBirth: date,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if(!validations.username || !validations.firstName || !validations.lastName || !validations.email || !validations.passwordMatch || !validations.ageValid) {
      setError('Please fill in all fields correctly.');
      return;
    }

    try {
      await registerUser(
        formData.username,
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.dateOfBirth ? formData.dateOfBirth.format('YYYY-MM-DD') : ''
      );
      setSuccess('User registered successfully');
    } catch (error: any) {
      setError(error.message);
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
              Register
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph>
              Create your account to get started
            </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
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
              <FormInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                validation={validations.username}
              />
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                validation={validations.firstName}
              />
              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                validation={validations.lastName}
              />
              <FormInput
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                validation={validations.email}
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
              />
              <ValidationMessages 
                validations={{
                  length: validations.passwordLength,
                  uppercase: validations.passwordUppercase,
                  number: validations.passwordNumber,
                }} 
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
              <DatePicker
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleDateChange}
                sx={{ width: "100%" }}
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
              
              <Divider sx={{ width: '100%', my: 2 }}>or</Divider>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                sx={{ mb: 1, color: 'text.primary', borderColor: 'divider' }}
              >
                Continue with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Apple />}
                sx={{ mb: 2, color: 'text.primary', borderColor: 'divider' }}
              >
                Continue with Apple
              </Button>
              
              <Typography variant="body2" color="textSecondary" align="center">
                Already have an account?{' '}
                <Link to="/login" style={{ color: theme.palette.primary.main }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default RegisterPage;