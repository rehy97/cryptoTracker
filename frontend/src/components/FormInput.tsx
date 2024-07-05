import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validation?: boolean;
  required?: boolean;
  InputProps?: any;
  InputLabelProps?: any;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  validation,
  required = false,
  InputProps = {},
  InputLabelProps = {},
}) => (
  <TextField
    variant="outlined"
    fullWidth
    label={label}
    name={name}
    type={type}
    InputLabelProps={InputLabelProps}
    value={value}
    onChange={onChange}
    required={required}
    InputProps={{
      endAdornment: validation && (
        <InputAdornment position="end">
          <CheckCircleOutlineIcon color="success" />
        </InputAdornment>
      ),
      ...InputProps,
    }}
  />
);

export default FormInput;
