import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, CircularProgress,
  Alert, AppBar, Toolbar, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  AccessTime as TimeIcon
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
  const [actionType, setActionType] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      const result = await api.assignToTester(selectedComplaint.id, selectedTester);
      toast.success(`✅ Complaint #${selectedComplaint.id} assigned to ${selectedTester}`);
      setSelectedComplaint(null);
      setSelectedTester('');
      setActionType('');
      fetchData();
    } catch (error) {
      toast.error('Assignment failed');
    }
  };

  const handleCloseComplaint = async () => {
    try {
      const result = await api.updateStatus(selectedComplaint.id, 'closed');
      toast.success(`✅ Complaint #${selectedComplaint.id} closed!`);
      setSelectedComplaint(null);
      setActionType('');
      fetchData();
    } catch (error) {
      toast.error('Failed to close complaint');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'closed': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'assigned': return '#FF9800';
      case 'pending': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <AppBar position="sticky" sx={{ bgcolor: '#1B5E20' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => { localStorage.clear(); setToken(null); }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={2}>
            <Card sx={{ bgcolor: '#2E7D32', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Total</Typography>
                <Typography variant="h4">{stats?.total_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <Card sx={{ bgcolor: '#F44336', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Pending</Typography>
                <Typography variant="h4">{stats?.pending_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <Card sx={{ bgcolor: '#FF9800', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Assigned</Typography>
                <Typography variant="h4">{stats?.assigned_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <Card sx={{ bgcolor: '#2196F3', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Completed</Typography>
                <Typography variant="h4">{stats?.completed_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <Card sx={{ bgcolor: '#4CAF50', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Closed</Typography>
                <Typography variant="h4">{stats?.closed_complaints || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2}>
            <Card sx={{ bgcolor: '#9C27B0', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Rate</Typography>
                <Typography variant="h4">{stats?.resolution_rate || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Complaints Table */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Complaints Management</Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained" sx={{ bgcolor: '#2E7D32' }}>
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#2E7D32' }} /></Box>
          ) : (
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>ID</TableCell>
                    {!isMobile && <TableCell>Type</TableCell>}
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    {!isMobile && <TableCell>Assigned To</TableCell>}
                    {!isMobile && <TableCell>Created</TableCell>}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      {!isMobile && <TableCell>{complaint.complaint_type}</TableCell>}
                      <TableCell>
                        <Chip label={complaint.priority} sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={complaint.status} sx={{ bgcolor: getStatusColor(complaint.status), color: 'white' }} />
                      </TableCell>
                      {!isMobile && <TableCell>{complaint.assigned_to_name || 'Unassigned'}</TableCell>}
                      {!isMobile && <TableCell>{formatDate(complaint.created_at)}</TableCell>}
                      <TableCell>
                        {complaint.status === 'pending' && (
                          <Button size="small" startIcon={<AssignIcon />} onClick={() => { setSelectedComplaint(complaint); setActionType('assign'); }}>
                            Assign
                          </Button>
                        )}
                        {complaint.status === 'completed' && (
                          <Button size="small" startIcon={<CheckIcon />} onClick={() => { setSelectedComplaint(complaint); setActionType('close'); }}>
                            Close
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
      <Dialog open={actionType === 'assign' && selectedComplaint} onClose={() => setActionType('')}>
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
          <Button onClick={() => setActionType('')}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" sx={{ bgcolor: '#2E7D32' }}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={actionType === 'close' && selectedComplaint} onClose={() => setActionType('')}>
        <DialogTitle>Close Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This complaint has been completed by the tester.
            <br />
            Waste reduced from {selectedComplaint?.fill_level_before}% to {selectedComplaint?.fill_level_after}%
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionType('')}>Cancel</Button>
          <Button onClick={handleCloseComplaint} variant="contained" sx={{ bgcolor: '#2E7D32' }}>Close Complaint</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
