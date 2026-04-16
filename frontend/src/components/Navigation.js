import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Map as RouteIcon,
  Description as DescriptionIcon,
  Place as MapIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteSweep as CleanIcon,
  Menu as MenuIcon,
  Science as TesterIcon,
  Warning as WarningIcon,
  AutoGraph as PredictIcon
} from '@mui/icons-material';
import { useColorMode } from '../ThemeContext';

const Navigation = ({ user, setToken }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleColorMode } = useColorMode();
  const isMobile = useMediaQuery('(max-width:900px)');
  const normalizedUser = (user || '').toLowerCase();
  const isAdmin = normalizedUser === 'admin';
  const isTester = normalizedUser.startsWith('tester');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon />, show: true },
    { path: '/submit', label: 'Create New', icon: <AddIcon />, show: !isTester },
    { path: '/routes', label: 'Route Optimization', icon: <RouteIcon />, show: !isTester },
    { path: '/complaint-map', label: 'Map', icon: <MapIcon />, show: true },
    { path: '/predict', label: 'Predict', icon: <PredictIcon />, show: !isTester },
    { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, show: !isTester },
    { path: '/tester', label: 'My Tasks', icon: <TesterIcon />, show: isTester },
    { path: '/anomalies', label: 'Anomalies', icon: <WarningIcon />, show: isAdmin },
    { path: '/admin', label: 'Admin Panel', icon: <AdminIcon />, show: isAdmin }
  ];

  const isActive = (path) => window.location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setAnchorEl(null);
    setMobileOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    window.location.href = path;
    setMobileOpen(false);
    setAnchorEl(null);
  };

  const activeItemSx = {
    bgcolor: 'rgba(96, 165, 250, 0.18)',
    color: '#f8fbff',
    border: '1px solid rgba(125, 176, 255, 0.18)',
    '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.24)' }
  };

  const drawer = (
    <Box
      sx={{
        width: 320,
        p: 2,
        bgcolor: 'rgba(6, 13, 24, 0.96)',
        height: '100%',
        backdropFilter: 'blur(18px)'
      }}
    >
      <Box sx={{ p: 1.5, mb: 2.5, borderRadius: 4, border: '1px solid rgba(148, 163, 184, 0.12)', background: 'linear-gradient(135deg, rgba(94, 162, 255, 0.15), rgba(100, 213, 255, 0.05))' }}>
        <Box display="flex" alignItems="center" gap={1.25}>
          <Box sx={{ width: 42, height: 42, borderRadius: 3, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(114,180,255,0.92), rgba(47,123,246,0.85))', boxShadow: '0 16px 28px rgba(47, 123, 246, 0.28)' }}>
            <CleanIcon sx={{ fontSize: 22, color: '#f8fbff' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fbff', lineHeight: 1.1 }}>
              CleanRoute-AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#aebbd2' }}>
              Smart waste operations
            </Typography>
          </Box>
        </Box>
      </Box>
      <List>
        {navItems.filter((item) => item.show).map((item) => (
          <ListItem
            key={item.path}
            onClick={() => navigateTo(item.path)}
            sx={{
              borderRadius: 3,
              mb: 1,
              color: '#cdd8ee',
              px: 1.25,
              cursor: 'pointer',
              ...(isActive(item.path) ? activeItemSx : {
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              })
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? '#f8fbff' : '#7db0ff' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem onClick={toggleColorMode} sx={{ borderRadius: 2, color: 'white', cursor: 'pointer' }}>
          <ListItemIcon sx={{ color: '#7db0ff' }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
        </ListItem>
        <ListItem onClick={handleLogout} sx={{ borderRadius: 2, color: '#FF6B6B', cursor: 'pointer' }}>
          <ListItemIcon sx={{ color: '#FF6B6B' }}>
            <LogoutIcon />
          </ListItemIcon>
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
          top: { xs: 10, sm: 14 },
          left: { xs: 8, sm: 16 },
          right: { xs: 8, sm: 16 },
          width: 'auto',
          borderRadius: { xs: 3, sm: 4 },
          bgcolor: 'rgba(8, 14, 26, 0.54)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 68, sm: 76 }, px: { xs: 1, sm: 2.5 }, gap: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }} onClick={() => navigateTo('/')}>
              <Box
                sx={{
                  width: { xs: 38, sm: 40 },
                  height: { xs: 38, sm: 40 },
                  borderRadius: '14px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(114,180,255,0.95), rgba(47,123,246,0.85))',
                  border: '1px solid rgba(125, 176, 255, 0.26)',
                  boxShadow: '0 16px 30px rgba(47,123,246,0.26)'
                }}
              >
                <CleanIcon sx={{ fontSize: { xs: 22, sm: 24 }, color: '#f8fbff' }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: '#f8fbff', fontSize: { xs: '0.92rem', sm: '1.08rem', md: '1.2rem' } }}
              >
                CleanRoute-AI
              </Typography>
              <Chip
                label="AI"
                size="small"
                sx={{
                  bgcolor: 'rgba(96, 165, 250, 0.16)',
                  color: '#dce8ff',
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'flex' }
                }}
              />
            </Box>

            {!isMobile && (
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  p: 0.75,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}
              >
                {navItems.filter((item) => item.show).map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      color: '#cdd8ee',
                      fontWeight: 600,
                      px: 1.8,
                      py: 1,
                      borderRadius: 999,
                      minWidth: 'auto',
                      fontSize: '0.88rem',
                      ...(isActive(item.path) ? activeItemSx : {
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
                      })
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1}>
              {!isMobile && (
                <IconButton
                  onClick={toggleColorMode}
                  size="small"
                  sx={{
                    color: '#dce8ff',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(148, 163, 184, 0.08)'
                  }}
                >
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              )}

              <Button
                startIcon={
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'rgba(96, 165, 250, 0.2)',
                      color: '#f8fbff',
                      fontWeight: 700
                    }}
                  >
                    {user?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                }
                onClick={handleMenuOpen}
                sx={{ textTransform: 'none', color: '#f8fbff', fontWeight: 600, display: { xs: 'none', sm: 'flex' }, px: 1.5 }}
              >
                {user || 'User'}
              </Button>

              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#f8fbff' }}>
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
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(8, 14, 26, 0.9)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: 3,
            mt: 1
          }
        }}
      >
        <MenuItem disabled>
          <Typography variant="body2" sx={{ color: '#dce8ff' }}>
            Logged in as {user || 'User'}
          </Typography>
        </MenuItem>
        <MenuItem onClick={toggleColorMode}>
          {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          <Typography sx={{ ml: 1.25, color: '#dce8ff' }}>
            {mode === 'dark' ? 'Light' : 'Dark'} Mode
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ color: '#f87171' }} />
          <Typography sx={{ ml: 1.25, color: '#f87171' }}>Logout</Typography>
        </MenuItem>
      </Menu>

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;

