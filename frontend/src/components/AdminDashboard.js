import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, IconButton, CircularProgress,
  TextField, Alert, AppBar, Toolbar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [testers, setTesters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTester, setSelectedTester] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      
      const statsData = await api.getDashboardStats();
      setStats(statsData);
      
      const testersData = await api.getTesters();
      setTesters(testersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTester) {
      toast.error('Please select a tester');
      return;
    }
    
    try {
      await api.assignToTester(selectedComplaint.id, selectedTester);
      toast.success(`Complaint #${selectedComplaint.id} assigned to ${selectedTester}`);
      setSelectedComplaint(null);
      setSelectedTester('');
      setActionType('');
      fetchData();
    } catch (error) {
      toast.error('Assignment failed');
    }
  };

  const handleMarkCompleted = async () => {
    if (!afterImage) {
      toast.error('Please upload after-cleaning photo');
      return;
    }
    
    const formData = new FormData();
    formData.append('after_image', afterImage);
    
    try {
      const result = await api.markCompleted(selectedComplaint.id, formData);
      toast.success(`Complaint #${selectedComplaint.id} completed! Waste reduced by ${result.reduction}%`);
      setSelectedComplaint(null);
      setAfterImage(null);
      setActionType('');
      fetchData();
    } catch (error) {
      toast.error('Failed to mark completed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#4CAF50';
      case 'assigned': return '#2196F3';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      default: return '#4CAF50';
    }
  };

  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1B5E20' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => window.location.href = '/'} startIcon={<DashboardIcon />}>
            Main Dashboard
          </Button>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, bgcolor: '#2E7D32', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Total Complaints</Typography>
                <Typography variant="h3">{stats?.total_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, bgcolor: '#FF9800', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Pending</Typography>
                <Typography variant="h3">{stats?.pending_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, bgcolor: '#2196F3', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Assigned</Typography>
                <Typography variant="h3">{stats?.assigned_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 4, bgcolor: '#4CAF50', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Completed</Typography>
                <Typography variant="h3">{stats?.completed_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Complaints Table */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Complaints Management</Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained" sx={{ bgcolor: '#4CAF50' }}>
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#4CAF50' }} /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Reported By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>{complaint.complaint_type}</TableCell>
                      <TableCell>
                        <Chip label={complaint.priority} sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={complaint.status} sx={{ bgcolor: getStatusColor(complaint.status), color: 'white' }} />
                      </TableCell>
                      <TableCell>{complaint.latitude}, {complaint.longitude}</TableCell>
                      <TableCell>{complaint.user_name || 'Anonymous'}</TableCell>
                      <TableCell>
                        {complaint.status === 'pending' && (
                          <Button size="small" startIcon={<AssignIcon />} onClick={() => { setSelectedComplaint(complaint); setActionType('assign'); }}>
                            Assign
                          </Button>
                        )}
                        {complaint.status === 'assigned' && (
                          <Button size="small" startIcon={<CheckIcon />} onClick={() => { setSelectedComplaint(complaint); setActionType('complete'); }}>
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Assign Dialog */}
      <Dialog open={actionType === 'assign' && selectedComplaint} onClose={() => { setSelectedComplaint(null); setActionType(''); }}>
        <DialogTitle>Assign Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Tester</InputLabel>
            <Select value={selectedTester} onChange={(e) => setSelectedTester(e.target.value)}>
              {testers.map(t => <MenuItem key={t.id} value={t.username}>{t.username}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelectedComplaint(null); setActionType(''); }}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" sx={{ bgcolor: '#4CAF50' }}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={actionType === 'complete' && selectedComplaint} onClose={() => { setSelectedComplaint(null); setActionType(''); }}>
        <DialogTitle>Complete Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label" sx={{ mt: 2, py: 2, width: '100%' }}>
            📸 Upload After-Cleaning Photo
            <input type="file" accept="image/*" hidden onChange={(e) => setAfterImage(e.target.files[0])} />
          </Button>
          {afterImage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Photo selected: {afterImage.name}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelectedComplaint(null); setActionType(''); }}>Cancel</Button>
          <Button onClick={handleMarkCompleted} variant="contained" sx={{ bgcolor: '#4CAF50' }}>Mark Completed</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
