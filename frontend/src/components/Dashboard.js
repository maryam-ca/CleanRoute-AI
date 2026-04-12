import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Button, TextField, InputAdornment, CircularProgress,
  Avatar, AppBar, Toolbar, Menu, MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  DeleteSweep as CleanIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Map as MapIcon,
  ShowChart as ChartIcon,
  Description as DescriptionIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const Dashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      const complaintsArray = Array.isArray(complaintsData) ? complaintsData : (complaintsData.results || complaintsData.data || []);
      setComplaints(complaintsArray);
      
      const statsData = await api.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast.success('Refreshed!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    toast.success('Logged out successfully');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      default: return '#4CAF50';
    }
  };

  const isAdmin = user === 'admin';

  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      {/* App Bar with Navigation */}
      <AppBar position="static" sx={{ bgcolor: '#1B5E20' }}>
        <Toolbar>
          <CleanIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            CleanRoute-AI
          </Typography>
          
          <Button color="inherit" onClick={() => navigateTo('/')} startIcon={<DashboardIcon />}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigateTo('/submit')} startIcon={<AddIcon />}>
            New Complaint
          </Button>
          <Button color="inherit" onClick={() => navigateTo('/routes')} startIcon={<MapIcon />}>
            Routes
          </Button>
          <Button color="inherit" onClick={() => navigateTo('/predict')} startIcon={<ChartIcon />}>
            Predict
          </Button>
          <Button color="inherit" onClick={() => navigateTo('/reports')} startIcon={<DescriptionIcon />}>
            Reports
          </Button>
          {isAdmin && (
            <Button color="inherit" onClick={() => navigateTo('/admin')} startIcon={<AdminIcon />}>
              Admin
            </Button>
          )}
          
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <PersonIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <Typography variant="body2">Logged in as: <strong>{user || 'User'}</strong></Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Total Complaints</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats?.total_complaints || complaints.length || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #F57C00, #FF9800)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Pending</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats?.pending_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #388E3C, #66BB6A)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Resolved</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats?.resolved_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #1565C0, #42A5F5)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Resolution Rate</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats?.resolution_rate || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Complaints Table */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid #E8F5E9' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20' }}>
              📋 Recent Complaints ({complaints.length})
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">🔍</InputAdornment>,
                }}
                sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 250 }}
              />
              <Button 
                variant="contained" 
                startIcon={<RefreshIcon />} 
                onClick={handleRefresh} 
                sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#4CAF50' }} />
              <Typography sx={{ mt: 2 }}>Loading complaints...</Typography>
            </Box>
          ) : complaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No complaints found. Submit your first complaint!</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.filter(c => 
                    c.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>
                        <Chip label={complaint.complaint_type} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={complaint.priority?.toUpperCase()} size="small" sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={complaint.status || 'pending'} size="small" sx={{ bgcolor: '#FF9800', color: 'white' }} />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationIcon sx={{ fontSize: 14, color: '#81C784' }} />
                          <Typography variant="body2">
                            {typeof complaint.latitude === 'number' ? complaint.latitude.toFixed(4) : complaint.latitude}, 
                            {typeof complaint.longitude === 'number' ? complaint.longitude.toFixed(4) : complaint.longitude}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>
                          {complaint.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <TimeIcon sx={{ fontSize: 14, color: '#81C784' }} />
                          <Typography variant="body2">
                            {new Date(complaint.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
