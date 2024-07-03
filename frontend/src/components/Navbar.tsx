import React from 'react';
import { AppBar, Button, Container, Divider, Drawer, MenuItem, Toolbar, Typography, useTheme, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { alpha } from '@mui/material/styles';
import ModeToggle from './ModeToggle';
import { useThemeContext } from '../theme/ThemeContextProvider';

const Navbar: React.FC = () => {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const { mode } = useThemeContext();
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleToggle = () => {
        setOpen(!open);
    };

    const navLinks = (
        <>
            <MenuItem component={Link} to="/cryptocurrencies" sx={{ py: '6px', px: '12px' }}>
                <Typography variant="body2" color='text.primary'>
                    Cryptocurrencies
                </Typography>
            </MenuItem>
            <MenuItem component={Link} to="/news" sx={{ py: '6px', px: '12px' }}>
                <Typography variant="body2" color='text.primary'>
                    News
                </Typography>
            </MenuItem>
            <MenuItem component={Link} to="/aboutus" sx={{ py: '6px', px: '12px' }}>
                <Typography variant="body2" color='text.primary'>
                    About Us
                </Typography>
            </MenuItem>
        </>
    );

    const authButtons = (
        <>
            <ModeToggle />
            <Button color="primary" variant="text" size="small" component={Link} to="/login">
                Login
            </Button>
            <Button color="primary" variant="contained" size="small" component={Link} to="/register">
                Register
            </Button>
        </>
    );

    const handleLogoClick = () => {
        navigate('/'); // Navigate to the root path ('/')
    };

    return (
        <div>
            <AppBar
                position="static"
                sx={{
                    boxShadow: 0,
                    bgcolor: 'transparent',
                    backgroundImage: 'none',
                    mt: 2,
                    color: theme.palette.text.primary,
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar
                        variant="regular"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0,
                            borderRadius: '999px',
                            backgroundColor: alpha(theme.palette.background.paper, mode === 'dark' ? 0.5 : 1),
                            color: mode === 'dark' ? theme.palette.text.primary : 'black',
                            backdropFilter: 'blur(10px)',
                            maxHeight: 40,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 1,
                        }}
                    >
                        <Link to="/" style={{ textDecoration: 'none' }} onClick={handleLogoClick}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    ml: '-18px',
                                    px: 0,
                                    cursor: 'pointer',
                                }}
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg"
                                    alt="logo"
                                    style={{ width: '55px', height: 'auto' }}
                                />
                            </Box>
                        </Link>
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {navLinks}
                        </Box>
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                gap: 0.5,
                                alignItems: 'center',
                            }}
                        >
                            {authButtons}
                        </Box>
                        <Box sx={{ display: { sm: '', md: 'none' } }}>
                            <Button
                                color="primary"
                                variant="text"
                                size="small"
                                onClick={handleToggle}
                                sx={{ minWidth: '30px', p: '4px' }}
                            >
                                <MenuIcon />
                            </Button>
                            <Drawer anchor="left" open={open} onClose={handleToggle} variant='temporary' ModalProps={{keepMounted: true}}>
                                <Box
                                    sx={{
                                        minWidth: '60dvw',
                                        flexDirection: 'column',
                                        alignItems: 'end',
                                        flexGrow: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'end',
                                            flexGrow: 1,
                                        }}
                                    >
                                        {navLinks}
                                        <Divider />
                                        <MenuItem>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                size="small"
                                                component={Link}
                                                sx={{ width: '100%' }}
                                                to="/login"
                                            >
                                                Login
                                            </Button>
                                        </MenuItem>
                                        <MenuItem>
                                            <Button
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                                component={Link}
                                                sx={{ width: '100%' }}
                                                to="/register"
                                            >
                                                Register
                                            </Button>
                                        </MenuItem>
                                    </Box>
                                </Box>
                            </Drawer>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
};

export default Navbar;