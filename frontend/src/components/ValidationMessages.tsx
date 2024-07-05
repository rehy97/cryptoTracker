import React from 'react';
import { Typography, Box } from '@mui/material';

interface ValidationMessagesProps {
  validations: { length: boolean; uppercase: boolean; number: boolean};
}

const ValidationMessages: React.FC<ValidationMessagesProps> = ({ validations }) => (
  <Box sx={{ width: '100%' }}>
    <Typography variant="caption" color={validations.length ? 'success.main' : 'error.main'}>
      {validations.length ? '✓' : '✕'} Password must have at least 8 characters
    </Typography>
    <br />
    <Typography variant="caption" color={validations.uppercase ? 'success.main' : 'error.main'}>
      {validations.uppercase ? '✓' : '✕'} Password must contain an uppercase letter
    </Typography>
    <br />
    <Typography variant="caption" color={validations.number ? 'success.main' : 'error.main'}>
      {validations.number ? '✓' : '✕'} Password must contain a number
    </Typography>
  </Box>
);

export default ValidationMessages;
