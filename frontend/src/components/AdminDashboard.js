import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Tab, Tabs, IconButton, Tooltip,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  DoneAll as DoneAllIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [testers, setTesters] = useState([]);
  const [selectedTester, setSelectedTester] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchTesters();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      const statsData = await api.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTesters = async () => {
    try {
      const testersData = await api.getTesters();
      setTesters(Array.isArray(testersData) ? testersData : []);
    } catch (error) {
      console.error('Error fetching testers:', error);
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
      setAssignDialogOpen(false);
      setSelectedTester('');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign complaint');
    }
  };

  const handleCloseComplaint = async () => {
    try {
      // Method 1: Using PATCH request
      const response = await fetch(`https://cleanroute-ai.onrender.com/api/complaints/${selectedComplaint.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'closed' })
      });
      
      if (response.ok) {
        toast.success(`✅ Complaint #${selectedComplaint.id} closed successfully!`);
        setCloseDialogOpen(false);
        setSelectedComplaint(null);
        fetchData();
      } else {
        // Method 2: Try using updateStatus API
        try {
          await api.updateStatus(selectedComplaint.id, 'closed');
          toast.success(`✅ Complaint #${selectedComplaint.id} closed!`);
          setCloseDialogOpen(false);
          setSelectedComplaint(null);
          fetchData();
        } catch (err) {
          throw new Error('Both methods failed');
        }
      }
    } catch (error) {
      console.error('Close error:', error);
      toast.error('Failed to close complaint. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'closed': return '#6B7280';
      case 'completed': return '#10B981';
      case 'assigned': return '#3B82F6';
      default: return '#F59E0B';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#10B981';
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `#${c.id}`.includes(searchTerm);
    
    if (tabValue === 0) return matchesSearch && c.status !== 'closed' && c.status !== 'completed';
    if (tabValue === 1) return matchesSearch && c.status === 'assigned';
    if (tabValue === 2) return matchesSearch && c.status === 'completed';
    if (tabValue === 3) return matchesSearch && c.status === 'closed';
    return matchesSearch;
  });

  return (
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Dashboard</Typography>
          <Typography variant="caption">Manage all complaints, assign to testers, and close completed tasks</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#E8F5E9' }}>
              <CardContent>
                <Typography variant="caption">Total Complaints</Typography>
                <Typography variant="h4">{complaints.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#FFF3E0' }}>
              <CardContent>
                <Typography variant="caption">Pending</Typography>
                <Typography variant="h4">{complaints.filter(c => c.status === 'pending').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#E3F2FD' }}>
              <CardContent>
                <Typography variant="caption">Assigned</Typography>
                <Typography variant="h4">{complaints.filter(c => c.status === 'assigned').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: '#E8F5E9' }}>
              <CardContent>
                <Typography variant="caption">Completed/Closed</Typography>
                <Typography variant="h4">{complaints.filter(c => c.status === 'completed' || c.status === 'closed').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label={`Pending (${complaints.filter(c => c.status !== 'closed' && c.status !== 'completed').length})`} />
              <Tab label={`Assigned (${complaints.filter(c => c.status === 'assigned').length})`} />
              <Tab label={`Completed (${complaints.filter(c => c.status === 'completed').length})`} />
              <Tab label={`Closed (${complaints.filter(c => c.status === 'closed').length})`} />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              sx={{ minWidth: 250 }}
            />
            <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained" sx={{ bgcolor: '#2E7D32' }}>
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#2E7D32' }} /></Box>
          ) : filteredComplaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><Typography>No complaints found</Typography></Box>
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
                    <TableCell>Fill Level</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>{complaint.complaint_type}</TableCell>
                      <TableCell>
                        <Chip label={complaint.priority} sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white', fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={complaint.status} sx={{ bgcolor: getStatusColor(complaint.status), color: 'white', fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${complaint.fill_level_before || 0}%`} size="small" />
                        {complaint.fill_level_after && (
                          <Typography variant="caption" display="block">→ {complaint.fill_level_after}%</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {complaint.status === 'pending' && (
                            <Button size="small" variant="contained" startIcon={<AssignIcon />} onClick={() => { setSelectedComplaint(complaint); setAssignDialogOpen(true); }} sx={{ bgcolor: '#FF9800' }}>
                              Assign
                            </Button>
                          )}
                          {complaint.status === 'completed' && (
                            <Button size="small" variant="contained" startIcon={<CloseIcon />} onClick={() => { setSelectedComplaint(complaint); setCloseDialogOpen(true); }} sx={{ bgcolor: '#4CAF50' }}>
                              Close
                            </Button>
                          )}
                          {complaint.status === 'closed' && (
                            <Chip label="Closed" size="small" sx={{ bgcolor: '#6B7280', color: 'white' }} />
                          )}
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

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Tester</InputLabel>
            <Select value={selectedTester} onChange={(e) => setSelectedTester(e.target.value)} label="Select Tester">
              {testers.map(tester => (
                <MenuItem key={tester.id} value={tester.username}>{tester.username}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" sx={{ bgcolor: '#FF9800' }}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Close Dialog */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Close Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Complaint Details:</strong><br />
            Type: {selectedComplaint?.complaint_type}<br />
            Priority: {selectedComplaint?.priority}<br />
            Fill Level Before: {selectedComplaint?.fill_level_before}%<br />
            Fill Level After: {selectedComplaint?.fill_level_after}%<br />
            Reduction: {(selectedComplaint?.fill_level_before - selectedComplaint?.fill_level_after)}%
          </Alert>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to close this complaint? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCloseComplaint} variant="contained" sx={{ bgcolor: '#4CAF50' }} startIcon={<CloseIcon />}>
            Confirm Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;



