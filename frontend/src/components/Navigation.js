import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Avatar, Box, Container, Chip, Drawer, List, ListItem,
  ListItemIcon, ListItemText, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Map as RouteIcon,
  Description as DescriptionIcon,\n  Map as MapIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteSweep as CleanIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useColorMode } from '../ThemeContext';

const Navigation = ({ user, setToken }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
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
  };

  const isAdmin = user === 'admin';

  const navItems = [
<<<<<<< HEAD
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/submit', label: 'Complaints', icon: <AddIcon /> },
    { path: '/routes', label: 'Routes', icon: <RouteIcon /> },
    { path: '/complaint-map', label: 'Map', icon: <MapIcon />, icon: <DescriptionIcon /> },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <AdminIcon /> });
  }

  const isActive = (path) => window.location.pathname === path;

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: 'rgba(2, 6, 23, 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(10, 102, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 }, minHeight: '64px' }}>
            {/* Logo */}
            <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }} onClick={() => navigateTo('/')}>
              <CleanIcon sx={{ fontSize: 28, color: '#00C6FF' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem' }}>
                CleanRoute-AI
              </Typography>
              <Chip 
                label="AI" 
                size="small" 
                sx={{ 
                  bgcolor: '#0A66FF', 
                  color: '#FFFFFF', 
                  fontWeight: 700, 
                  fontSize: '0.7rem',
                  height: '20px'
                }} 
              />
=======
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

  const activeItemSx = {
    bgcolor: 'rgba(96, 165, 250, 0.18)',
    color: '#f8fbff',
    border: '1px solid rgba(125, 176, 255, 0.18)',
    '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.24)' }
  };

  const drawer = (
    <Box sx={{ width: 300, p: 2, bgcolor: 'rgba(6, 13, 24, 0.96)', height: '100%', backdropFilter: 'blur(18px)' }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3, p: 1 }}>
        <CleanIcon sx={{ fontSize: 28, color: '#7db0ff' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fbff' }}>CleanRoute-AI</Typography>
      </Box>
      <List>
        {navItems.filter(item => item.show).map((item) => (
          <ListItem 
            key={item.path} 
            onClick={() => navigateTo(item.path)}
            sx={{ 
              borderRadius: 3,
              mb: 1,
              color: '#cdd8ee',
              ...(window.location.pathname === item.path ? activeItemSx : {
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              })
            }}
          >
            <ListItemIcon sx={{ color: window.location.pathname === item.path ? '#f8fbff' : '#7db0ff' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem onClick={toggleColorMode} sx={{ borderRadius: 2, color: 'white' }}>
          <ListItemIcon sx={{ color: '#7db0ff' }}>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
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
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 14,
          left: { xs: 10, sm: 16 },
          right: { xs: 10, sm: 16 },
          width: 'auto',
          borderRadius: 4,
          bgcolor: 'rgba(8, 14, 26, 0.54)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 76, px: { xs: 1, sm: 2.5 }, gap: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '14px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(125, 176, 255, 0.24), rgba(37, 99, 235, 0.42))',
                  border: '1px solid rgba(125, 176, 255, 0.2)'
                }}
              >
                <CleanIcon sx={{ fontSize: { xs: 22, sm: 24 }, color: '#f8fbff' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fbff', fontSize: { xs: '0.95rem', sm: '1.08rem', md: '1.2rem' } }}>
                CleanRoute-AI
              </Typography>
              <Chip label="AI" size="small" sx={{ bgcolor: 'rgba(96, 165, 250, 0.16)', color: '#dce8ff', fontWeight: 700, display: { xs: 'none', sm: 'flex' } }} />
>>>>>>> final-updates
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
<<<<<<< HEAD
              <Box display="flex" alignItems="center" gap={1}>
                {navItems.map((item) => (
=======
              <Box display="flex" alignItems="center" gap={1} sx={{ p: 0.75, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                {navItems.filter(item => item.show).map((item) => (
>>>>>>> final-updates
                  <Button
                    key={item.path}
                    onClick={() => navigateTo(item.path)}
                    sx={{
<<<<<<< HEAD
                      color: isActive(item.path) ? '#00C6FF' : '#E5E7EB',
                      fontWeight: isActive(item.path) ? 600 : 500,
                      borderRadius: '8px',
                      px: 2,
                      py: 1,
                      bgcolor: isActive(item.path) ? 'rgba(10, 102, 255, 0.15)' : 'transparent',
                      '&:hover': { 
                        bgcolor: 'rgba(10, 102, 255, 0.1)',
                        color: '#00C6FF'
                      }
=======
                      color: '#cdd8ee',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 999,
                      minWidth: 'auto',
                      ...(window.location.pathname === item.path ? activeItemSx : {
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
                      })
>>>>>>> final-updates
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* User Menu */}
            <Box display="flex" alignItems="center" gap={1}>
<<<<<<< HEAD
              <IconButton onClick={toggleColorMode} size="small" sx={{ color: '#E5E7EB' }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              
              <Button
                startIcon={
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#0A66FF', fontSize: '0.875rem' }}>
                    {user?.charAt(0).toUpperCase()}
                  </Avatar>
                }
                onClick={() => setAnchorEl(true)}
                sx={{ 
                  textTransform: 'none', 
                  color: '#FFFFFF', 
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
=======
              {!isMobile && (
                <IconButton onClick={toggleColorMode} size="small" sx={{ color: '#dce8ff', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              )}
              
              <Button
                startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(96, 165, 250, 0.2)', color: '#f8fbff', fontWeight: 700 }}>{user?.charAt(0).toUpperCase()}</Avatar>}
                onClick={handleMenuOpen}
                sx={{ textTransform: 'none', color: '#f8fbff', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
>>>>>>> final-updates
              >
                {user || 'User'}
              </Button>
              
              {isMobile && (
<<<<<<< HEAD
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#FFFFFF' }}>
=======
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#f8fbff' }}>
>>>>>>> final-updates
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
            background: 'rgba(2, 6, 23, 0.98)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(10,102,255,0.3)',
            borderRadius: '12px',
            mt: 1,
          }
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
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2, bgcolor: '#020617', height: '100%' }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3, p: 1 }}>
            <CleanIcon sx={{ fontSize: 32, color: '#00C6FF' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>CleanRoute-AI</Typography>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem 
                key={item.path} 
                onClick={() => navigateTo(item.path)}
                sx={{ 
                  borderRadius: 2, 
                  mb: 1,
                  bgcolor: isActive(item.path) ? 'rgba(10,102,255,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(10,102,255,0.1)' }
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? '#00C6FF' : '#9CA3AF' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{ sx: { color: isActive(item.path) ? '#00C6FF' : '#E5E7EB' } }}
                />
              </ListItem>
            ))}
            <ListItem onClick={toggleColorMode} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ color: '#9CA3AF' }}>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
              <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} primaryTypographyProps={{ sx: { color: '#E5E7EB' } }} />
            </ListItem>
            <ListItem onClick={handleLogout} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ color: '#EF4444' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ sx: { color: '#EF4444' } }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Toolbar />
    </>
  );
};

export default Navigation;

