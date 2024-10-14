import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Switch, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Button,
  Snackbar,
  Alert,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
  PaletteMode,
  alpha,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { amber, grey } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Header from '../components/Header';
import AppDrawer from '../components/AppDrawer';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardComponent {
  id: string;
  name: string;
  enabled: boolean;
}

const defaultComponents: DashboardComponent[] = [
  { id: 'portfolio-card', name: 'Portfolio Overview', enabled: true },
  { id: 'portfolio-performance', name: 'Portfolio Performance', enabled: true },
  { id: 'crypto-distribution', name: 'Crypto Distribution', enabled: true },
  { id: 'top-gainers', name: 'Top Gainers', enabled: true },
  { id: 'top-losers', name: 'Top Losers', enabled: true },
  { id: 'holdings-table', name: 'Holdings Table', enabled: true },
];

interface SortableItemProps {
  component: DashboardComponent;
  onToggle: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ component, onToggle }) => {
    const theme = useTheme();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: component.id });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <ListItem
        ref={setNodeRef}
        style={style}
        {...attributes}
        sx={{ 
          bgcolor: alpha(theme.palette.background.paper, 0.6), 
          mb: 1, 
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <IconButton size="small" sx={{ mr: 2, cursor: 'grab', color: theme.palette.text.secondary }} {...listeners}>
          <DragIndicatorIcon />
        </IconButton>
        <ListItemText 
          primary={component.name} 
          primaryTypographyProps={{ fontWeight: 'medium' }}
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={() => onToggle(component.id)}
            checked={component.enabled}
            color="primary"
          />
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [components, setComponents] = useState<DashboardComponent[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [mode, setMode] = useState<PaletteMode>('dark');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
  
    const theme = React.useMemo(() => createTheme({
        palette: {
          mode,
          primary: { main: amber[500] },
          secondary: { main: '#f50057' },
        },
      }), [mode]);
  
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
  
    useEffect(() => {
      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedSettings) {
        setComponents(JSON.parse(savedSettings));
      } else {
        setComponents(defaultComponents);
      }
    }, []);
  
    const handleToggle = (id: string) => {
      setComponents(prevComponents => 
        prevComponents.map(component =>
          component.id === id ? { ...component, enabled: !component.enabled } : component
        )
      );
    };
  
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
  
      if (active.id !== over?.id) {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };
  
    const handleSave = () => {
      localStorage.setItem('dashboardSettings', JSON.stringify(components));
      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
    };
  
    const handleDrawerToggle = () => {
      setDrawerOpen(!drawerOpen);
    };
  
    const handleModeChange = (newMode: PaletteMode) => {
      setMode(newMode);
    };
  
    const handleCSVImport = () => {
      setCsvModalOpen(true);
    };
  
    const handleNavigation = (path: string) => {
      navigate(path);
    };
  
    return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Header 
            onDrawerToggle={handleDrawerToggle}
            onModeChange={handleModeChange}
            onCSVImport={handleCSVImport}
            onLogout={logout}
            username={user?.username || ''}
            mode={mode}
          />
          <AppDrawer 
            open={drawerOpen}
            onClose={handleDrawerToggle}
            onNavigate={handleNavigation}
          />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg" sx={{mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Dashboard Settings
            </Typography>
            <Paper elevation={3} sx={{ 
              p: 3, 
              mt: 2, 
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
                Customize Your Dashboard
              </Typography>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={components}
                  strategy={verticalListSortingStrategy}
                >
                  <List>
                    {components.map((component) => (
                      <SortableItem 
                        key={component.id} 
                        component={component} 
                        onToggle={handleToggle}
                      />
                    ))}
                  </List>
                </SortableContext>
              </DndContext>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </Container>
          </Box>
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })} 
              severity={snackbar.severity} 
              sx={{ width: '100%' }}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    );
  };
  
  export default SettingsPage;