import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Avatar, Box, Container, useMediaQuery, Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Route as RouteIcon,
  Description as DescriptionIcon,
  LocationOn as MapIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DeleteSweep as CleanIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  TaskAlt as TaskIcon,
  AutoGraph as PredictIcon
} from '@mui/icons-material';

const Navigation = ({ user, setToken }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setAnchorEl(null);
    setMobileOpen(false);
  };

  const navigateTo = (path) => {
    window.location.href = path;
    setMobileOpen(false);
    setAnchorEl(null);
  };

  const isAdmin = user === 'admin';
  const isTester = user?.startsWith('tester');

  // Navigation items based on user role
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon />, show: true },
        { path: '/complaint-map', label: 'Map', icon: <MapIcon />, show: true },
        { path: '/routes', label: 'Routes', icon: <RouteIcon />, show: true },
        { path: '/predict', label: 'Predict', icon: <PredictIcon />, show: true },
        { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, show: true },
        { path: '/admin', label: 'Admin', icon: <AdminIcon />, show: true },
      ];
    } else if (isTester) {
      return [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon />, show: true },
        { path: '/tester', label: 'My Tasks', icon: <TaskIcon />, show: true },
        { path: '/complaint-map', label: 'Map', icon: <MapIcon />, show: true },
        { path: '/routes', label: 'Routes', icon: <RouteIcon />, show: true },
        { path: '/predict', label: 'Predict', icon: <PredictIcon />, show: true },
        { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, show: true },
      ];
    } else {
      return [
        { path: '/', label: 'Dashboard', icon: <DashboardIcon />, show: true },
        { path: '/submit', label: 'New Complaint', icon: <AddIcon />, show: true },
        { path: '/complaint-map', label: 'Map', icon: <MapIcon />, show: true },
        { path: '/routes', label: 'Routes', icon: <RouteIcon />, show: true },
        { path: '/predict', label: 'Predict', icon: <PredictIcon />, show: true },
        { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, show: true },
      ];
    }
  };

  const navItems = getNavItems();
  const isActive = (path) => window.location.pathname === path;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ 
        background: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(10,102,255,0.3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 1100
      }}>
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

            {/* User Avatar Button */}
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                onClick={handleMenuOpen}
                sx={{
                  textTransform: 'none',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#0A66FF', fontSize: '0.875rem' }}>
                  {user?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user || 'User'}</Typography>
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

      {/* User Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            background: 'rgba(2, 6, 23, 0.98)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(10,102,255,0.3)',
            borderRadius: '12px',
            mt: 1,
            minWidth: 200,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
            {user || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            {isAdmin ? 'Administrator' : isTester ? 'Field Tester' : 'Citizen'}
          </Typography>
        </Box>

        <MenuItem onClick={() => { navigateTo('/profile'); handleMenuClose(); }} sx={{ color: '#E5E7EB' }}>
          <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigateTo('/settings'); handleMenuClose(); }} sx={{ color: '#E5E7EB' }}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          Settings
        </MenuItem>
        
        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: '#EF4444' }} />
          <Typography sx={{ color: '#EF4444', fontWeight: 500 }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Menu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(2, 6, 23, 0.98)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(10,102,255,0.3)',
            borderRadius: 12,
            width: 280,
            mt: 7,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>{user || 'User'}</Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            {isAdmin ? 'Administrator' : isTester ? 'Field Tester' : 'Citizen'}
          </Typography>
        </Box>
        {navItems.filter(item => item.show).map((item) => (
          <MenuItem key={item.path} onClick={() => navigateTo(item.path)} selected={isActive(item.path)}>
            <Box display="flex" alignItems="center" gap={1.5}>
              {item.icon}
              <Typography sx={{ color: '#E5E7EB' }}>{item.label}</Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: '#EF4444' }} />
          <Typography sx={{ color: '#EF4444' }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Spacer for fixed navbar */}
      <Toolbar />
    </>
  );
};

export default Navigation;
