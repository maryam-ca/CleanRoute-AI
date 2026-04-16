import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Avatar, Box, Container, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Route as RouteIcon,
  AutoGraph as PredictIcon,
  Description as DescriptionIcon,
  LocationOn as MapIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DeleteSweep as CleanIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const Navigation = ({ user, setToken }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setMobileOpen(false);
  };

  const navigateTo = (path) => {
    window.location.href = path;
    setMobileOpen(false);
    setAnchorEl(null);
  };

  const isAdmin = user === 'admin';
  const isTester = user?.startsWith('tester');

  // Simplified navigation - max 4-5 items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon />, show: true },
    { path: '/submit', label: 'New Complaint', icon: <AddIcon />, show: !isTester },
    { path: '/complaint-map', label: 'Map', icon: <MapIcon />, show: true },
    { path: '/routes', label: 'Routes', icon: <RouteIcon />, show: true },
    { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, show: true },
    { path: '/predict', label: 'Predict', icon: <PredictIcon />, show: true },
    { path: '/admin', label: 'Admin', icon: <AdminIcon />, show: isAdmin },
  ];

  const isActive = (path) => window.location.pathname === path;

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px', px: { xs: 1, sm: 2 } }}>
            {/* Logo */}
            <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }} onClick={() => navigateTo('/')}>
              <CleanIcon sx={{ fontSize: 28, color: '#00C6FF' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem' }}>
                CleanRoute-AI
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box display="flex" alignItems="center" gap={1}>
                {navItems.filter(item => item.show).map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      color: isActive(item.path) ? '#00C6FF' : '#E5E7EB',
                      fontWeight: isActive(item.path) ? 600 : 500,
                      borderRadius: '8px',
                      px: 2,
                      py: 1,
                      bgcolor: isActive(item.path) ? 'rgba(10,102,255,0.15)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(10,102,255,0.1)',
                        color: '#00C6FF',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* User Menu */}
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                startIcon={
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#0A66FF', fontSize: '0.875rem' }}>
                    {user?.charAt(0).toUpperCase()}
                  </Avatar>
                }
                onClick={() => setAnchorEl(true)}
                sx={{ textTransform: 'none', color: '#FFFFFF', fontWeight: 500 }}
              >
                {user || 'User'}
              </Button>

              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#FFFFFF' }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(10,102,255,0.3)',
            borderRadius: '12px',
            mt: 1,
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="body2" sx={{ color: '#E5E7EB' }}>Logged in as <strong>{user}</strong></Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1, color: '#EF4444' }} />
          <Typography sx={{ color: '#EF4444' }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Menu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(10,102,255,0.3)',
            borderRadius: 12,
            width: 280,
            mt: 7,
          },
        }}
      >
        {navItems.filter(item => item.show).map((item) => (
          <MenuItem key={item.path} onClick={() => navigateTo(item.path)} selected={isActive(item.path)}>
            <Box display="flex" alignItems="center" gap={1.5}>
              {item.icon}
              <Typography sx={{ color: '#E5E7EB' }}>{item.label}</Typography>
            </Box>
          </MenuItem>
        ))}
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: '#EF4444' }} />
          <Typography sx={{ color: '#EF4444' }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Spacer */}
      <Toolbar />
    </>
  );
};

export default Navigation;


