import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  Avatar, Box, Container, useMediaQuery, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Route as RouteIcon,
  Description as DescriptionIcon,
  LocationOn as MapIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  TaskAlt as TaskIcon,
  AutoGraph as PredictIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';

const Navigation = ({ user, setToken }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user || '',
    email: '',
    fullName: ''
  });
  const [settingsData, setSettingsData] = useState({
    notifications: true,
    emailAlerts: true,
    language: 'English'
  });

  const isMobile = useMediaQuery('(max-width:900px)');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setAnchorEl(null);
    setMobileOpen(false);
    toast.success('Logged out successfully');
  };

  const navigateTo = (path) => {
    window.location.href = path;
    setMobileOpen(false);
    setAnchorEl(null);
  };

  const isAdmin = user === 'admin';
  const isTester = user?.startsWith('tester');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cleanroute-ai.onrender.com/api/users/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        toast.success('Profile updated successfully!');
        setProfileOpen(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cleanroute-ai.onrender.com/api/users/settings/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      if (response.ok) {
        toast.success('Settings saved successfully!');
        setSettingsOpen(false);
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <Toaster position="top-right" />
      
      <AppBar position="fixed" elevation={0} sx={{ 
        background: 'linear-gradient(180deg, rgba(4, 19, 40, 0.95) 0%, rgba(8, 29, 58, 0.9) 100%)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(116,221,255,0.24)',
        boxShadow: '0 12px 28px rgba(3,12,25,0.22)',
        zIndex: 1100
      }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px', px: { xs: 1, sm: 2 } }}>
            {/* Logo */}
            <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigateTo('/')}>
              <Box
                component="img" className="logo-image"
                src="/logo.svg"
                alt="CleanRoute-AI Logo"
                sx={{
                  width: { xs: 44, sm: 54 },
                  height: { xs: 44, sm: 54 },
                  borderRadius: '14px'
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5FBFF', fontSize: { xs: '1rem', sm: '1.15rem' }, lineHeight: 1.1 }}>
                  CleanRoute<span style={{ color: '#d8ff72' }}>AI</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#bdd8eb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Smart Route Optimization with AI
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box display="flex" alignItems="center" gap={1}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigateTo(item.path)}
                    sx={{
                      color: isActive(item.path) ? '#d8ff72' : '#e9f7ff',
                      fontWeight: isActive(item.path) ? 600 : 500,
                      borderRadius: '999px',
                      px: 2,
                      py: 1,
                      bgcolor: isActive(item.path) ? 'rgba(83,215,105,0.14)' : 'transparent',
                      border: isActive(item.path) ? '1px solid rgba(216,255,114,0.24)' : '1px solid transparent',
                      '&:hover': {
                        bgcolor: 'rgba(54,196,255,0.1)',
                        color: '#74ddff',
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
                  borderRadius: '999px',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#36c4ff', color: '#041328', fontWeight: 800, fontSize: '0.875rem' }}>
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
            border: '1px solid rgba(116,221,255,0.3)',
            borderRadius: '18px',
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

        <MenuItem onClick={() => { setProfileOpen(true); handleMenuClose(); }} sx={{ color: '#E5E7EB' }}>
          <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { setSettingsOpen(true); handleMenuClose(); }} sx={{ color: '#E5E7EB' }}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          Settings
        </MenuItem>
        
        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: '#EF4444' }} />
          <Typography sx={{ color: '#EF4444', fontWeight: 500 }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Profile Edit Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'linear-gradient(180deg, rgba(13, 42, 78, 0.96) 0%, rgba(8, 24, 46, 0.98) 100%)', border: '1px solid rgba(116,221,255,0.24)', borderRadius: 4 } }}>
        <DialogTitle sx={{ bgcolor: 'rgba(54,196,255,0.1)', color: '#FFFFFF' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon sx={{ color: '#74ddff' }} />
            Edit Profile
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Update your personal information
            </Alert>
            <TextField
              fullWidth
              label="Username"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              disabled
              helperText="Username cannot be changed"
              sx={{ '& .MuiInputBase-root': { color: '#FFFFFF' }, '& .MuiInputLabel-root': { color: '#9CA3AF' } }}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              placeholder="Enter your email"
              sx={{ '& .MuiInputBase-root': { color: '#FFFFFF' }, '& .MuiInputLabel-root': { color: '#9CA3AF' } }}
            />
            <TextField
              fullWidth
              label="Full Name"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              placeholder="Enter your full name"
              sx={{ '& .MuiInputBase-root': { color: '#FFFFFF' }, '& .MuiInputLabel-root': { color: '#9CA3AF' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setProfileOpen(false)} variant="outlined" sx={{ borderRadius: '999px' }}>
            Cancel
          </Button>
          <Button onClick={handleProfileUpdate} variant="contained" disabled={loading} sx={{ borderRadius: '999px' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'linear-gradient(180deg, rgba(13, 42, 78, 0.96) 0%, rgba(8, 24, 46, 0.98) 100%)', border: '1px solid rgba(116,221,255,0.24)', borderRadius: 4 } }}>
        <DialogTitle sx={{ bgcolor: 'rgba(54,196,255,0.1)', color: '#FFFFFF' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon sx={{ color: '#74ddff' }} />
            Application Settings
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Configure your preferences
            </Alert>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: '#FFFFFF' }}>Email Notifications</Typography>
              <Button
                variant={settingsData.emailAlerts ? "contained" : "outlined"}
                onClick={() => setSettingsData({ ...settingsData, emailAlerts: !settingsData.emailAlerts })}
                sx={{ borderRadius: '999px', minWidth: 100 }}
              >
                {settingsData.emailAlerts ? 'ON' : 'OFF'}
              </Button>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: '#FFFFFF' }}>Push Notifications</Typography>
              <Button
                variant={settingsData.notifications ? "contained" : "outlined"}
                onClick={() => setSettingsData({ ...settingsData, notifications: !settingsData.notifications })}
                sx={{ borderRadius: '999px', minWidth: 100 }}
              >
                {settingsData.notifications ? 'ON' : 'OFF'}
              </Button>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: '#FFFFFF' }}>Language</Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  const languages = ['English', 'Urdu', 'Arabic'];
                  const currentIndex = languages.indexOf(settingsData.language);
                  const nextIndex = (currentIndex + 1) % languages.length;
                  setSettingsData({ ...settingsData, language: languages[nextIndex] });
                }}
                sx={{ borderRadius: '999px', minWidth: 120 }}
              >
                {settingsData.language}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSettingsOpen(false)} variant="outlined" sx={{ borderRadius: '999px' }}>
            Cancel
          </Button>
          <Button onClick={handleSettingsUpdate} variant="contained" disabled={loading} sx={{ borderRadius: '999px' }}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Drawer */}
      <Menu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(2, 6, 23, 0.98)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(116,221,255,0.24)',
            borderRadius: 18,
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
        {navItems.map((item) => (
          <MenuItem key={item.path} onClick={() => navigateTo(item.path)} selected={isActive(item.path)}>
            <Box display="flex" alignItems="center" gap={1.5}>
              {item.icon}
              <Typography sx={{ color: '#E5E7EB' }}>{item.label}</Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={() => { setProfileOpen(true); setMobileOpen(false); }} sx={{ color: '#E5E7EB' }}>
          <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { setSettingsOpen(true); setMobileOpen(false); }} sx={{ color: '#E5E7EB' }}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          Settings
        </MenuItem>
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








