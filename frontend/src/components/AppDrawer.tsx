import React, { useMemo, useCallback } from 'react';
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

interface MenuItem {
  readonly text: string;
  readonly icon: JSX.Element;
  readonly path: string;
}

// Memoized menu item component
const DrawerItem = React.memo(({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: MenuItem; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  return (
    <ListItem
      button
      onClick={onClick}
      sx={{
        backgroundColor: isActive ? grey[800] : 'transparent',
        '&:hover': {
          backgroundColor: grey[800],
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      <ListItemIcon 
        sx={{ 
          color: isActive ? amber[500] : 'text.secondary',
          transition: 'color 0.2s ease',
        }}
      >
        {item.icon}
      </ListItemIcon>
      <ListItemText
        primary={item.text}
        sx={{
          color: isActive ? amber[500] : 'text.secondary',
          transition: 'color 0.2s ease',
        }}
      />
    </ListItem>
  );
});

DrawerItem.displayName = 'DrawerItem';

// Constant menu items defined outside component
const MENU_ITEMS: readonly MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Market', icon: <ShowChartIcon />, path: '/market' },
  { text: 'Transactions', icon: <SwapHorizIcon />, path: '/transactions' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
] as const;

const AppDrawer: React.FC<DrawerProps> = React.memo(({ 
  open, 
  onClose, 
  onNavigate 
}) => {
  // Memoize current path
  const currentPath = useMemo(() => 
    window.location.pathname, 
    []  // Empty dependency array as we'll handle path changes through navigation
  );

  // Memoize drawer content
  const drawerContent = useMemo(() => (
    <Box 
      sx={{ 
        width: 250, 
        backgroundColor: grey[900], 
        height: '100vh',
        overflowX: 'hidden'
      }} 
      role="presentation"
    >
      <List>
        {MENU_ITEMS.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <DrawerItem
              key={item.text}
              item={item}
              isActive={isActive}
              onClick={() => handleNavigation(item.path)}
            />
          );
        })}
      </List>
    </Box>
  ), [currentPath]); // Only re-render when currentPath changes

  // Memoize navigation handler
  const handleNavigation = useCallback((path: string) => {
    onNavigate(path);
    onClose();
  }, [onNavigate, onClose]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
});

// Add display name for better debugging
AppDrawer.displayName = 'AppDrawer';

export default AppDrawer;