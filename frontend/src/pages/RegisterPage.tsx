import React, { useState } from 'react';
import { Box, Typography, Container, Button, Alert, InputAdornment, IconButton, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import PasswordField from '../components/PasswordField';
import ValidationMessages from '../components/ValidationMessages';
import useValidations from '../hooks/useValidations';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/useAuth';

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
    setError('');
    setSuccess('');

    if(!validations.username || !validations.firstName || !validations.lastName || !validations.email || !validations.passwordMatch || !validations.ageValid) {
      setError('Please fill in all fields.');
      return;
    }

    if(!validations.username) {
      setError('Username must be at least 8 characters long.');
      return;
    }
    if(!validations.firstName) {
      setError('First name must be at least 3 characters long.');
      return;
    }
    if(!validations.lastName) {
      setError('Last name must be at least 3 characters long.');
      return;
    }
    if (!validations.passwordMatch) {
      setError('Passwords do not match.');
      return;
    }
    if (!validations.ageValid) {
      setError('You must be at least 18 years old to register.');
      return;
    }
    if(!validations.email)
    {
        setError('Invalid format email address.');
        return;
    }

    try {
      await registerUser(
        formData.username,
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.dateOfBirth
      );
      setSuccess('User registered successfully');
    } catch (error: any) {
      setError(error.message);
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
            }} />
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
          <FormInput
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.dateOfBirth}
            onChange={handleChange}
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
            /*disabled={
              !validations.username ||
              !validations.firstName ||
              !validations.lastName ||
              !validations.email ||
              !validations.passwordLength ||
              !validations.passwordUppercase ||
              !validations.passwordNumber ||
              !validations.passwordMatch ||
              !validations.ageValid
            }*/
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

