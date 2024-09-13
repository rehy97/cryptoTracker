import React from 'react';
import { Fab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const AddTransactionFab: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/create-transaction'); // Přesměruje na stránku pro přidání transakce
  };

  return (
    <Fab
      color="primary"
      aria-label="add transaction"
      onClick={handleClick}
      sx={{ position: 'fixed', bottom: 16, right: 16 }}
    >
      <AddIcon />
    </Fab>
  );
};

export default AddTransactionFab;