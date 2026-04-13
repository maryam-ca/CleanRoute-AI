import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Avatar, Box, Container, Chip, useTheme, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Map as MapIcon,
  ShowChart as ChartIcon,
  Description as DescriptionIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteSweep as CleanIcon,
  Menu as MenuIcon,
  Assignment as TaskIcon
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

  // Check user roles
  const isAdmin = user === 'admin';
  const isTester = user === 'tester1' || user === 'tester2' || user === 'tester' || user?.startsWith('tester');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon />, show: true },
    { path: '/submit', label: 'New Complaint', icon: <AddIcon />, show: true },
    { path: '/routes', label: 'Route Optimizer', icon: <MapIcon />, show: true },
    { path: '/predict', label: 'Waste Predict', icon: <ChartIcon />, show: true },
    { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, show: true },
    { path: '/admin', label: 'Admin Panel', icon: <AdminIcon />, show: isAdmin },
    { path: '/tester', label: 'My Tasks', icon: <TaskIcon />, show: isTester },
  ];

  const drawer = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3, p: 1 }}>
        <CleanIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>CleanRoute-AI</Typography>
      </Box>
      <List>
        {navItems.filter(item => item.show).map((item) => (
          <ListItem 
            key={item.path} 
            onClick={() => navigateTo(item.path)}
            sx={{ 
              borderRadius: 2, 
              mb: 0.5,
              bgcolor: window.location.pathname === item.path ? theme.palette.action.selected : 'transparent',
              '&:hover': { bgcolor: theme.palette.action.hover }
            }}
          >
            <ListItemIcon sx={{ color: window.location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem onClick={toggleColorMode} sx={{ borderRadius: 2 }}>
          <ListItemIcon>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
          <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
        </ListItem>
        <ListItem onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 1, sm: 0.5 }, minHeight: { xs: 56, sm: 64 } }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CleanIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                CleanRoute-AI
              </Typography>
              <Chip label="AI" size="small" sx={{ bgcolor: theme.palette.primary.main, color: 'white', display: { xs: 'none', sm: 'flex' } }} />
            </Box>

            {!isMobile && (
              <Box display="flex" alignItems="center" gap={1}>
                {navItems.filter(item => item.show).map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      color: window.location.pathname === item.path ? theme.palette.primary.main : 'text.secondary',
                      fontWeight: window.location.pathname === item.path ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1}>
              {!isMobile && (
                <IconButton onClick={toggleColorMode} size="small">
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              )}
              
              <Button
                startIcon={<Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, fontSize: '0.8rem' }}>{user?.charAt(0).toUpperCase()}</Avatar>}
                onClick={handleMenuOpen}
                sx={{ textTransform: 'none', color: 'text.primary', display: { xs: 'none', sm: 'flex' } }}
              >
                {user || 'User'}
              </Button>
              
              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)}>
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
