import React from 'react';
import {Box, Typography, Container, Button} from '@mui/material';

const Hero = () => {
    return (
        <Box
        sx={{
          pt: 8,
          pb: 6,
          backgroundColor: (theme) => (theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900]),
        }}
      >
        <Container maxWidth="sm">
          <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
            Vítejte ve světě kryptoměn
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            Objevte nejnovější informace o kryptoměnách a jejich trendech.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" sx={{ m: 1 }}>
              Začít
            </Button>
            <Button variant="outlined" color="primary" sx={{ m: 1 }}>
              Více informací
            </Button>
          </Box>
        </Container>
      </Box>
    );
}

export default Hero;