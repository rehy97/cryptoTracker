import React from 'react';
import { 
  Drawer, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { amber, grey } from '@mui/material/colors';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const AppDrawer: React.FC<DrawerProps> = ({ open, onClose, onNavigate }) => {
  const currentPath = window.location.pathname;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Market', icon: <ShowChartIcon />, path: '/market' },
    { text: 'Transactions', icon: <SwapHorizIcon />, path: '/transactions' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250, backgroundColor: grey[900], height: '100vh' }} role="presentation">
        <List>
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;

            return (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  backgroundColor: isActive ? grey[800]: 'transparent',
                  '&:hover': {
                    backgroundColor: grey[800], 
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    color: isActive ? 'primary.main' : 'text.secondary',  // Barva textu
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default AppDrawer;