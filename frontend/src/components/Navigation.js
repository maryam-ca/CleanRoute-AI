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
  Description as DescriptionIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteSweep as CleanIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useColorMode } from '../ThemeContext';

const NAV_BG = 'rgba(2, 6, 23, 0.85)';
const NAV_BORDER = 'none';
const ACTIVE_BG = 'rgba(10, 102, 255, 0.15)';
const ACTIVE_BORDER = '2px solid #0A66FF';
const TEXT_COLOR = '#FFFFFF';
const ACCENT_COLOR = '#00C6FF';

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

  // ONLY 5 MAIN ITEMS - Clean and simple
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/submit', label: 'Complaints', icon: <AddIcon /> },
    { path: '/routes', label: 'Routes', icon: <RouteIcon /> },
    { path: '/reports', label: 'Reports', icon: <DescriptionIcon /> },
  ];

  // Add Admin only if user is admin
  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <AdminIcon /> });
  }

  const drawer = (
    <Box sx={{ width: 280, p: 2, bgcolor: '#020617', height: '100%' }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3, p: 1 }}>
        <CleanIcon sx={{ fontSize: 32, color: ACCENT_COLOR }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_COLOR }}>CleanRoute-AI</Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.path} 
            onClick={() => navigateTo(item.path)}
            sx={{ 
              borderRadius: 2, 
              mb: 1,
              bgcolor: window.location.pathname === item.path ? ACTIVE_BG : 'transparent',
              borderLeft: window.location.pathname === item.path ? ACTIVE_BORDER : 'none',
              '&:hover': { bgcolor: 'rgba(10,102,255,0.1)' }
            }}
          >
            <ListItemIcon sx={{ color: window.location.pathname === item.path ? ACCENT_COLOR : '#9CA3AF' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem onClick={toggleColorMode} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: '#9CA3AF' }}>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
          <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
        </ListItem>
        <ListItem onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: '#EF4444' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: NAV_BG, backdropFilter: 'blur(12px)', borderBottom: NAV_BORDER }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 }, minHeight: '60px' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CleanIcon sx={{ fontSize: 28, color: ACCENT_COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_COLOR, fontSize: '1rem' }}>
                CleanRoute-AI
              </Typography>
            </Box>

            {!isMobile && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      color: window.location.pathname === item.path ? ACCENT_COLOR : TEXT_COLOR,
                      fontWeight: 500,
                      borderRadius: '8px',
                      px: 2,
                      py: 0.75,
                      bgcolor: window.location.pathname === item.path ? ACTIVE_BG : 'transparent',
                      '&:hover': { bgcolor: 'rgba(10,102,255,0.1)' }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={toggleColorMode} size="small" sx={{ color: '#9CA3AF' }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              
              <Button
                startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: '#0A66FF', fontSize: '0.875rem' }}>{user?.charAt(0).toUpperCase()}</Avatar>}
                onClick={() => setAnchorEl(true)}
                sx={{ textTransform: 'none', color: TEXT_COLOR, fontWeight: 500 }}
              >
                {user || 'User'}
              </Button>
              
              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: TEXT_COLOR }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
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
