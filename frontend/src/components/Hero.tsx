import React from 'react';
import { Box, Typography, Container, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Info } from '@mui/icons-material';
import heroImage from '../heroImage.png';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                pt: 8,
                pb: 6,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography component="h1" variant="h2" color="textPrimary" gutterBottom>
                            Welcome to the World of Cryptocurrencies
                        </Typography>
                        <Typography variant="h5" color="textSecondary" paragraph>
                            Discover the latest information about cryptocurrencies and their trends.
                        </Typography>
                        <Box sx={{ display: 'flex', mt: 4 }}>
                            <Button 
                                onClick={() => navigate("/register")} 
                                variant="contained" 
                                color="primary" 
                                sx={{ mr: 2 }}
                                startIcon={<TrendingUp />}
                            >
                                Get Started
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                startIcon={<Info />}
                            >
                                More Information
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            sx={{
                                maxHeight: 400,
                                objectFit: 'cover',
                                borderRadius: 2,
                            }}
                            alt="Hero image"
                            src={heroImage}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default Hero;
