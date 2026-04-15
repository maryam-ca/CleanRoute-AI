import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Avatar, Box, Container, Chip, useTheme, Drawer, List, ListItem,
  ListItemIcon, ListItemText, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Map as RouteIcon,
  LocationOn as MapLocationIcon,
  ShowChart as ChartIcon,
  Description as DescriptionIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteSweep as CleanIcon,
  Menu as MenuIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useColorMode } from '../ThemeContext';

const Navigation = ({ user, setToken }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    handleMenuClose();
    setMobileOpen(false);
  };

  const navigateTo = (path) => {
    window.location.href = path;
    setMobileOpen(false);
  };

  const isAdmin = user === 'admin';
  const isTester = user === 'tester1' || user === 'tester2' || user === 'tester';

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon />, show: true },
    { path: '/submit', label: 'New Complaint', icon: <AddIcon />, show: true },
    { path: '/routes', label: 'Route Optimizer', icon: <RouteIcon />, show: true },
    { path: '/complaint-map', label: 'Complaint Map', icon: <MapLocationIcon />, show: true },
    { path: '/predict', label: 'Waste Predict', icon: <ChartIcon />, show: true },
    { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, show: true },
    { path: '/admin', label: 'Admin Panel', icon: <AdminIcon />, show: isAdmin },
    { path: '/tester', label: 'My Tasks', icon: <TaskIcon />, show: isTester },
    { path: '/anomalies', label: 'Anomaly Map', icon: <WarningIcon />, show: isAdmin },
  ];

  const drawer = (
    <Box sx={{ width: 280, p: 2, bgcolor: '#1E1B4B', height: '100%' }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3, p: 1 }}>
        <CleanIcon sx={{ fontSize: 32, color: '#F59E0B' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>CleanRoute-AI</Typography>
      </Box>
      <List>
        {navItems.filter(item => item.show).map((item) => (
          <ListItem 
            key={item.path} 
            onClick={() => navigateTo(item.path)}
            sx={{ 
              borderRadius: 2, 
              mb: 1,
              bgcolor: window.location.pathname === item.path ? '#F59E0B' : 'transparent',
              color: window.location.pathname === item.path ? '#1E1B4B' : 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
            }}
          >
            <ListItemIcon sx={{ color: window.location.pathname === item.path ? '#1E1B4B' : '#F59E0B' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem onClick={toggleColorMode} sx={{ borderRadius: 2, color: 'white' }}>
          <ListItemIcon sx={{ color: '#F59E0B' }}>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
          <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
        </ListItem>
        <ListItem onClick={handleLogout} sx={{ borderRadius: 2, color: '#FF6B6B' }}>
          <ListItemIcon sx={{ color: '#FF6B6B' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" elevation={3} sx={{ bgcolor: '#F97316', borderBottom: '3px solid #EC4899' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CleanIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'white' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' } }}>
                CleanRoute-AI
              </Typography>
              <Chip label="AI" size="small" sx={{ bgcolor: '#EC4899', color: 'white', fontWeight: 700, display: { xs: 'none', sm: 'flex' } }} />
            </Box>

            {!isMobile && (
              <Box display="flex" alignItems="center" gap={1}>
                {navItems.filter(item => item.show).map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      bgcolor: window.location.pathname === item.path ? '#EC4899' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1}>
              {!isMobile && (
                <IconButton onClick={toggleColorMode} size="small" sx={{ color: 'white' }}>
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              )}
              
              <Button
                startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: '#EC4899', color: 'white', fontWeight: 700 }}>{user?.charAt(0).toUpperCase()}</Avatar>}
                onClick={handleMenuOpen}
                sx={{ textTransform: 'none', color: 'white', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
              >
                {user || 'User'}
              </Button>
              
              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'white' }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem disabled><Typography variant="body2">Logged in as <strong>{user}</strong></Typography></MenuItem>
        <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Logout</MenuItem>
      </Menu>

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;
