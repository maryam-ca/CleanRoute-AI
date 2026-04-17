import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const CompletedComplaints = ({ token, user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedComplaints();
  }, []);

  const fetchCompletedComplaints = async () => {
    setLoading(true);
    try {
      const allComplaints = await api.getComplaints();
      const completed = Array.isArray(allComplaints) ? allComplaints.filter(c => c.status === 'completed') : [];
      setComplaints(completed);
    } catch (error) {
      console.error('Error fetching completed complaints:', error);
      toast.error('Failed to load completed complaints');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#0A66FF';
      default: return '#22C55E';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(15,23,42,0.3) 100%)' }}>
        <Container maxWidth="xl">
          <Box display="flex" alignItems="center" gap={2}>
            <ArchiveIcon sx={{ fontSize: 32, color: '#22C55E' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Completed Complaints Archive</Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>History of resolved complaints</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Completed Complaints ({complaints.length})
            </Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchCompletedComplaints} variant="contained" size="small">
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#22C55E' }} /></Box>
          ) : complaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 48, color: '#22C55E', mb: 2 }} />
              <Typography sx={{ color: '#9CA3AF' }}>No completed complaints yet</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(34,197,94,0.1)' }}>
                    <TableCell sx={{ color: '#FFFFFF' }}>ID</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Type</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Priority</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Location</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Completed By</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Completed At</TableCell>
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
                      <TableCell>{complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}</TableCell>
                      <TableCell>
                        <Chip label={complaint.assigned_to || complaint.assigned_to_username || 'N/A'} size="small" sx={{ bgcolor: '#0A66FF', color: 'white' }} />
                      </TableCell>
                      <TableCell>
                        {complaint.completed_at ? new Date(complaint.completed_at).toLocaleString() : 'N/A'}
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

export default CompletedComplaints;
