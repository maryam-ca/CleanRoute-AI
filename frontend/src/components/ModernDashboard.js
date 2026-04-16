import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Button, Paper, Chip } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import GlassCard from './GlassCard';
import api from '../services/api';

const ModernDashboard = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const assigned = complaints.filter((c) => c.status === 'assigned').length;
  const completed = complaints.filter((c) => c.status === 'completed').length;

  const statsCards = [
    { title: 'Total Complaints', value: total, color: '#FFFFFF', icon: '📋', trend: 12 },
    { title: 'Pending', value: pending, color: '#F59E0B', icon: '⏳', trend: -5 },
    { title: 'Assigned', value: assigned, color: '#60A5FA', icon: '🚛', trend: 8 },
    { title: 'Completed', value: completed, color: '#22C55E', icon: '✅', trend: 15 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' };
      case 'assigned':
        return { bg: 'rgba(96,165,250,0.15)', text: '#93C5FD' };
      case 'completed':
        return { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' };
      default:
        return { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return { bg: 'rgba(239,68,68,0.15)', text: '#F87171' };
      case 'high':
        return { bg: 'rgba(96,165,250,0.15)', text: '#60A5FA' };
      case 'medium':
        return { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' };
      default:
        return { bg: 'rgba(191,219,254,0.16)', text: '#BFDBFE' };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />

      <Box
        sx={{
          mx: { xs: 2, md: 3 },
          py: 3,
          px: 4,
          color: 'white',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(79, 140, 255, 0.16) 0%, rgba(15, 23, 42, 0.18) 100%)'
        }}
      >
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fbff' }}>
                Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#cdd8ee', mt: 0.5 }}>
                Welcome back, {user || 'User'}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { window.location.href = '/submit'; }}>
                New Complaint
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Grid container spacing={3} mb={4}>
          {statsCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <GlassCard
                title={card.title}
                value={card.value}
                color={card.color}
                icon={card.icon}
                loading={loading}
                trend={card.trend}
              />
            </Grid>
          ))}
        </Grid>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 5,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fbff' }}>
                Recent Complaints
              </Typography>
              <Button size="small" onClick={() => { window.location.href = '/admin'; }}>
                View All
              </Button>
            </Box>

            {loading ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>Loading complaints...</Typography>
              </Box>
            ) : complaints.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>No complaints found</Typography>
              </Box>
            ) : (
              <Box>
                {complaints.slice(0, 5).map((complaint) => {
                  const statusStyle = getStatusColor(complaint.status);
                  const priorityStyle = getPriorityColor(complaint.priority);

                  return (
                    <Box
                      key={complaint.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        flexWrap: 'wrap',
                        gap: 1,
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#FFFFFF' }}>
                          #{complaint.id} - {complaint.complaint_type?.replace('_', ' ') || 'Complaint'}
                        </Typography>
                        <Box display="flex" gap={1} mt={0.75} flexWrap="wrap">
                          <Chip
                            label={complaint.status || 'pending'}
                            size="small"
                            sx={{ bgcolor: statusStyle.bg, color: statusStyle.text, fontWeight: 600 }}
                          />
                          <Chip
                            label={complaint.priority || 'medium'}
                            size="small"
                            sx={{ bgcolor: priorityStyle.bg, color: priorityStyle.text, fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'Unknown date'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ModernDashboard;

