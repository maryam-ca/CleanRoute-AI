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

// Fixed Dark Blue Theme - High Contrast
const NAV_BG = 'rgba(2, 6, 23, 0.95)';
const ACTIVE_BG = 'rgba(10, 102, 255, 0.2)';
const TEXT_COLOR = '#FFFFFF';
const TEXT_SECONDARY = '#E5E7EB';
const ACCENT_COLOR = '#00C6FF';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.1)';

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

  // Clean navigation - 5 main items max
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/submit', label: 'Complaints', icon: <AddIcon /> },
    { path: '/routes', label: 'Routes', icon: <RouteIcon /> },
    { path: '/reports', label: 'Reports', icon: <DescriptionIcon /> },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <AdminIcon /> });
  }

  const drawer = (
    <Box sx={{ width: 280, p: 2, bgcolor: '#020617', height: '100%' }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3, p: 1 }}>
        <CleanIcon sx={{ fontSize: 32, color: ACCENT_COLOR }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_COLOR }}>CleanRoute-AI</Typography>
        <Chip label="AI" size="small" sx={{ bgcolor: ACCENT_COLOR, color: '#020617', fontWeight: 700, ml: 1 }} />
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
              borderLeft: window.location.pathname === item.path ? `3px solid ${ACCENT_COLOR}` : 'none',
              '&:hover': { bgcolor: 'rgba(10,102,255,0.15)' }
            }}
          >
            <ListItemIcon sx={{ color: window.location.pathname === item.path ? ACCENT_COLOR : TEXT_SECONDARY }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{ sx: { color: window.location.pathname === item.path ? ACCENT_COLOR : TEXT_SECONDARY, fontWeight: 500 } }}
            />
          </ListItem>
        ))}
        <ListItem onClick={toggleColorMode} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: TEXT_SECONDARY }}>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
          <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} primaryTypographyProps={{ sx: { color: TEXT_SECONDARY } }} />
        </ListItem>
        <ListItem onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: '#EF4444' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ sx: { color: '#EF4444' } }} />
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
          bgcolor: NAV_BG, 
          backdropFilter: 'blur(12px)', 
          borderBottom: `1px solid ${BORDER_COLOR}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 }, minHeight: '64px' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CleanIcon sx={{ fontSize: 28, color: ACCENT_COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: TEXT_COLOR, fontSize: '1.1rem' }}>
                CleanRoute-AI
              </Typography>
              <Chip label="AI" size="small" sx={{ bgcolor: ACCENT_COLOR, color: '#020617', fontWeight: 700, display: { xs: 'none', sm: 'flex' } }} />
            </Box>

            {!isMobile && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      color: window.location.pathname === item.path ? ACCENT_COLOR : TEXT_SECONDARY,
                      fontWeight: 500,
                      borderRadius: '8px',
                      px: 2,
                      py: 1,
                      bgcolor: window.location.pathname === item.path ? ACTIVE_BG : 'transparent',
                      '&:hover': { bgcolor: 'rgba(10,102,255,0.15)' }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={toggleColorMode} size="small" sx={{ color: TEXT_SECONDARY }}>
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

      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
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

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;
