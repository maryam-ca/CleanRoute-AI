import React from 'react';
import { Box, Button, Container, Chip, Typography, IconButton, Tooltip } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Add as AddIcon, 
  Map as MapIcon, 
  ShowChart as ChartIcon,
  LocationOn as LocationIcon, Description as DescriptionIcon, AdminPanelSettings as AdminPanelSettingsIcon, Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotifIcon
} from '@mui/icons-material';

const Navigation = ({ user, setToken }) => {
  const currentPath = window.location.pathname;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon />, color: '#4CAF50' },
    { path: '/submit', label: 'New Complaint', icon: <AddIcon />, color: '#2196F3' },
    { path: '/routes', label: 'Route Optimization', icon: <MapIcon />, color: '#FF9800' },
    { path: '/predict', label: 'Waste Prediction', icon: <ChartIcon />, color: '#9C27B0' },
    { path: '/map', label: 'Live Map', icon: <LocationIcon />, color: '#FF5722' },
    { path: '/reports', label: 'Reports', icon: <DescriptionIcon />, color: '#9C27B0' },
    { path: '/admin', label: 'Admin', icon: <AdminPanelSettingsIcon />, color: '#9C27B0' },
    { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon />, color: '#FF5722' },
  ];

  return (
    <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <DashboardIcon sx={{ fontSize: 32, color: '#81C784' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                CleanRoute-AI
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                AI-Powered Waste Management System
              </Typography>
            </Box>
            <Chip label="LIVE" size="small" sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 600, ml: 2 }} />
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={currentPath === item.path ? 'contained' : 'text'}
                startIcon={item.icon}
                onClick={() => window.location.href = item.path}
                sx={{
                  color: 'white',
                  bgcolor: currentPath === item.path ? item.color : 'transparent',
                  '&:hover': { bgcolor: `${item.color}40` }
                }}
              >
                {item.label}
              </Button>
            ))}
            
            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'white', ml: 1 }}>
                <NotifIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton sx={{ color: 'white' }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Typography variant="body2" sx={{ mx: 1, color: '#81C784' }}>{user || 'Admin'}</Typography>
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<LogoutIcon />}
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
              }}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: '#81C784', bgcolor: 'rgba(129,199,132,0.1)' } }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Navigation;



