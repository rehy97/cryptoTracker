import React from 'react';
import { 
  Box, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  PaletteMode
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

interface HeaderProps {
  onDrawerToggle: () => void;
  onModeChange: (mode: PaletteMode) => void;
  onCSVImport: () => void;
  onLogout: () => void;
  username: string;
  mode: PaletteMode;
}

const Header: React.FC<HeaderProps> = ({ 
  onDrawerToggle, 
  onModeChange, 
  onCSVImport, 
  onLogout, 
  username, 
  mode 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Box component="header" sx={{ 
      p: 2, 
      borderBottom: 1, 
      borderColor: 'divider', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      bgcolor: 'background.paper' 
    }}>
      <IconButton onClick={onDrawerToggle} edge="start" color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Avatar 
        onClick={handleMenuOpen}
        sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}
      >
        {getUserInitials(username)}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onModeChange(mode === 'dark' ? 'light' : 'dark'); handleMenuClose(); }}>
          <ListItemIcon>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={mode === 'dark' ? "Light Mode" : "Dark Mode"} />
        </MenuItem>
        <MenuItem onClick={() => { onCSVImport(); handleMenuClose(); }}>
          <ListItemIcon>
            <FileUploadIcon />
          </ListItemIcon>
          <ListItemText primary="Import CSV" />
        </MenuItem>
        <MenuItem onClick={() => { onLogout(); handleMenuClose(); }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;