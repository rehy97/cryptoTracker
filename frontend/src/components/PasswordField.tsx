import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  showPassword: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickShowPassword: () => void;
  validations: { length: boolean; uppercase: boolean; number: boolean };
  required?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  value,
  showPassword,
  onChange,
  onClickShowPassword,
  validations,
  required = false,
}) => (
  <TextField
    variant="outlined"
    fullWidth
    label={label}
    name={name}
    type={showPassword ? 'text' : 'password'}
    value={value}
    onChange={onChange}
    required={required}
    InputProps={{
      endAdornment: (
        <>
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={onClickShowPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
          {(validations.length && validations.uppercase && validations.number) && (
            <InputAdornment position="end">
              <CheckCircleOutlineIcon color="success" />
            </InputAdornment>
          )}
        </>
      ),
    }}
  />
);

export default PasswordField;
