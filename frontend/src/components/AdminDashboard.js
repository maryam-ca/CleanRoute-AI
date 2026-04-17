import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert,
  Switch, FormControlLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignIcon,
  FilterList as FilterIcon,
  AutoFixHigh as AutoFixHighIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [testers, setTesters] = useState([]);
  const [testerStats, setTesterStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTester, setSelectedTester] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [autoAssignMode, setAutoAssignMode] = useState(true);

  useEffect(() => {
    fetchData();
    fetchTesters();
  }, []);

  // Fetch tester stats when complaints or testers change
  useEffect(() => {
    if (complaints.length > 0 && testers.length > 0) {
      calculateTesterStats();
    }
  }, [complaints, testers]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchTesters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/testers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTesters(Array.isArray(data) ? data : []);
      } else {
        setTesters([
          { id: 1, username: 'tester1' },
          { id: 2, username: 'tester2' },
          { id: 3, username: 'tester3' },
          { id: 4, username: 'tester4' },
          { id: 5, username: 'tester5' }
        ]);
      }
    } catch (error) {
      setTesters([
        { id: 1, username: 'tester1' },
        { id: 2, username: 'tester2' },
        { id: 3, username: 'tester3' },
        { id: 4, username: 'tester4' },
        { id: 5, username: 'tester5' }
      ]);
    }
  };

  const calculateTesterStats = () => {
    const stats = testers.map(tester => {
      const assigned = complaints.filter(c => 
        c.status === 'assigned' && 
        (c.assigned_to === tester.username || c.assigned_to_username === tester.username)
      ).length;
      
      const completed = complaints.filter(c => 
        c.status === 'completed' && 
        (c.assigned_to === tester.username || c.assigned_to_username === tester.username)
      ).length;
      
      return {
        username: tester.username,
        assigned: assigned,
        completed: completed,
        total: assigned + completed
      };
    });
    setTesterStats(stats);
  };

  const handleAssign = async () => {
    if (!selectedTester) {
      toast.error('Please select a tester');
      return;
    }
    
    setAssigning(true);
    try {
      await api.assignComplaint(selectedComplaint.id, selectedTester);
      toast.success(`Complaint #${selectedComplaint.id} assigned to ${selectedTester}`);
      setSelectedComplaint(null);
      setSelectedTester('');
      fetchData();
    } catch (error) {
      console.error('Assign error:', error);
      toast.error(error.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  const handleAutoAssign = async (complaint) => {
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/complaints/auto_assign/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ complaint_id: complaint.id })
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Auto-assigned to ${result.assigned_to}`);
        fetchData();
      } else {
        toast.error(result.error || 'Auto-assign failed');
      }
    } catch (error) {
      console.error('Auto-assign error:', error);
      toast.error('Failed to auto-assign');
    } finally {
      setAssigning(false);
    }
  };

  const autoAssignAllPending = async () => {
    if (!autoAssignMode) return;
    
    const pendingComplaints = complaints.filter(c => c.status === 'pending');
    if (pendingComplaints.length === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      for (const complaint of pendingComplaints) {
        const response = await fetch('http://localhost:8000/api/complaints/auto_assign/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ complaint_id: complaint.id })
        });
        await response.json();
      }
      fetchData();
    } catch (error) {
      console.error('Auto-assign error:', error);
    }
  };

  useEffect(() => {
    if (autoAssignMode) {
      autoAssignAllPending();
      const interval = setInterval(autoAssignAllPending, 15000);
      return () => clearInterval(interval);
    }
  }, [autoAssignMode, complaints]);

  const handleFilterClick = (status) => {
    setFilterStatus(status);
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const assigned = complaints.filter(c => c.status === 'assigned').length;
  const completed = complaints.filter(c => c.status === 'completed').length;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#0A66FF';
      default: return '#22C55E';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#0A66FF';
      case 'completed': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)' }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Admin Dashboard</Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Manage complaints, assign testers, and track progress</Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={autoAssignMode}
                  onChange={(e) => setAutoAssignMode(e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00C6FF' } }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <AutoFixHighIcon sx={{ color: autoAssignMode ? '#00C6FF' : '#9CA3AF', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: autoAssignMode ? '#00C6FF' : '#9CA3AF', fontWeight: 600 }}>
                    {autoAssignMode ? '🤖 AUTO-ASSIGN ACTIVE' : '👤 MANUAL MODE'}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tester Workload Summary */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 4, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>Tester Workload Summary</Typography>
          <Grid container spacing={2}>
            {testerStats.map((tester, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(10,102,255,0.2)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00C6FF' }}>{tester.username}</Typography>
                    <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 800 }}>{tester.assigned}</Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Assigned Tasks</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" sx={{ color: '#22C55E' }}>Completed: {tester.completed}</Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total: {tester.total}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card onClick={() => handleFilterClick('all')} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Complaints</Typography>
                <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 800 }}>{total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card onClick={() => handleFilterClick('pending')} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Pending</Typography>
                <Typography variant="h4" sx={{ color: '#F59E0B', fontWeight: 800 }}>{pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card onClick={() => handleFilterClick('assigned')} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Assigned</Typography>
                <Typography variant="h4" sx={{ color: '#0A66FF', fontWeight: 800 }}>{assigned}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card onClick={() => handleFilterClick('completed')} sx={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Completed</Typography>
                <Typography variant="h4" sx={{ color: '#22C55E', fontWeight: 800 }}>{completed}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Complaints Table with Assigned To Column */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              {filterStatus === 'all' ? 'All Complaints' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Complaints`}
            </Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained" size="small">Refresh</Button>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#0A66FF' }} /></Box>
          ) : filteredComplaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#9CA3AF' }}>No complaints found</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(10,102,255,0.1)' }}>
                    <TableCell sx={{ color: '#FFFFFF' }}>ID</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Type</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Priority</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Location</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Fill Level</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Assigned To</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Status</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>{complaint.complaint_type}</TableCell>
                      <TableCell><Chip label={complaint.priority} sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} /></TableCell>
                      <TableCell>{complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}</TableCell>
                      <TableCell><Chip label={`${complaint.fill_level_before || 0}%`} size="small" /></TableCell>
                      <TableCell>
                        {complaint.assigned_to_username || complaint.assigned_to ? (
                          <Chip 
                            label={complaint.assigned_to_username || complaint.assigned_to} 
                            size="small" 
                            sx={{ bgcolor: '#0A66FF', color: 'white', fontWeight: 600 }} 
                          />
                        ) : (
                          <Chip label="Unassigned" size="small" sx={{ bgcolor: '#9CA3AF', color: 'white' }} />
                        )}
                      </TableCell>
                      <TableCell><Chip label={complaint.status} sx={{ bgcolor: getStatusColor(complaint.status), color: 'white' }} /></TableCell>
                      <TableCell align="center">
                        {complaint.status === 'pending' && autoAssignMode ? (
                          <Chip label="Auto-assigning..." size="small" sx={{ bgcolor: '#8B5CF6', color: 'white' }} />
                        ) : complaint.status === 'pending' && !autoAssignMode ? (
                          <Button variant="contained" startIcon={<AssignIcon />} onClick={() => setSelectedComplaint(complaint)} size="small">
                            Assign
                          </Button>
                        ) : (
                          <Chip label={complaint.status} size="small" sx={{ bgcolor: getStatusColor(complaint.status), color: 'white' }} />
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

      <Dialog open={!!selectedComplaint} onClose={() => { setSelectedComplaint(null); setSelectedTester(''); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'rgba(10,102,255,0.15)', color: '#FFFFFF' }}>Assign Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              <strong>Complaint Details:</strong><br />
              Type: {selectedComplaint?.complaint_type}<br />
              Priority: {selectedComplaint?.priority}<br />
              Fill Level: {selectedComplaint?.fill_level_before}%
            </Alert>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9CA3AF' }}>Select Tester</InputLabel>
              <Select value={selectedTester} onChange={(e) => setSelectedTester(e.target.value)} label="Select Tester" sx={{ color: '#FFFFFF' }}>
                {testers.map((tester) => (
                  <MenuItem key={tester.id || tester.username} value={tester.username}>{tester.username}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setSelectedComplaint(null); setSelectedTester(''); }} variant="outlined">Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!selectedTester || assigning}>
            {assigning ? 'Assigning...' : 'Assign to Tester'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
