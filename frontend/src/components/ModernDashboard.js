import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Button, Paper, Chip, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import GlassCard from './GlassCard';
import api from '../services/api';

const ModernDashboard = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      setLastUpdated(new Date());
      toast.success('Data refreshed', { icon: '🔄', duration: 2000 });
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
  
  // Calculate trends (mock data - in production, compare with previous period)
  const trends = {
    total: { value: 12, positive: true },
    pending: { value: 5, positive: false },
    assigned: { value: 8, positive: true },
    completed: { value: 15, positive: true }
  };

  const statsCards = [
    { 
      title: 'Total Complaints', 
      value: total, 
      color: '#FFFFFF', 
      icon: '📋', 
      trend: trends.total.value,
      trendPositive: trends.total.positive,
      description: 'All time complaints'
    },
    { 
      title: 'Pending', 
      value: pending, 
      color: '#F59E0B', 
      icon: '⏳', 
      trend: trends.pending.value,
      trendPositive: trends.pending.positive,
      description: 'Awaiting assignment'
    },
    { 
      title: 'Assigned', 
      value: assigned, 
      color: '#60A5FA', 
      icon: '🚛', 
      trend: trends.assigned.value,
      trendPositive: trends.assigned.positive,
      description: 'In progress'
    },
    { 
      title: 'Completed', 
      value: completed, 
      color: '#22C55E', 
      icon: '✅', 
      trend: trends.completed.value,
      trendPositive: trends.completed.positive,
      description: 'Successfully resolved'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' };
      case 'assigned': return { bg: 'rgba(96,165,250,0.15)', text: '#93C5FD' };
      case 'completed': return { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' };
      default: return { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return { bg: 'rgba(239,68,68,0.15)', text: '#F87171' };
      case 'high': return { bg: 'rgba(96,165,250,0.15)', text: '#60A5FA' };
      case 'medium': return { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' };
      default: return { bg: 'rgba(191,219,254,0.16)', text: '#BFDBFE' };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <Box
        sx={{
          mx: { xs: 2, md: 3 },
          py: { xs: 3, md: 4.5 },
          px: { xs: 2.25, sm: 3, md: 4.5 },
          color: 'white',
          border: '1px solid rgba(10,102,255,0.3)',
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} flexWrap="wrap" gap={2}>
            <Box>
              <Chip 
                label="Live Operations Dashboard" 
                size="small" 
                sx={{ mb: 1.5, bgcolor: 'rgba(10,102,255,0.2)', color: '#00C6FF', fontWeight: 700 }} 
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.8rem', sm: '2.4rem' } }}>
                Waste Management Hub
                <Box component="span" sx={{ display: 'block', color: '#00C6FF', fontSize: '1.2rem', mt: 1 }}>
                  Real-time monitoring & control
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 2, maxWidth: 560 }}>
                Welcome back, {user || 'User'}. Track live complaint activity, monitor assignment flow, and take action faster from one unified dashboard.
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Box>
            <Box display="flex" gap={1.5} flexWrap="wrap" width={{ xs: '100%', md: 'auto' }}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={fetchData} 
                disabled={loading}
                sx={{ 
                  borderRadius: '999px',
                  borderColor: '#0A66FF',
                  color: '#0A66FF',
                  '&:hover': { borderColor: '#00C6FF', color: '#00C6FF', background: 'rgba(10,102,255,0.1)' }
                }}
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => { window.location.href = '/submit'; }}
                sx={{ 
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 0 20px rgba(0,198,255,0.4)' }
                }}
              >
                New Complaint
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Cards */}
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Grid container spacing={3} mb={4}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  title={card.title}
                  value={card.value}
                  color={card.color}
                  icon={card.icon}
                  loading={loading}
                  trend={card.trend}
                  trendPositive={card.trendPositive}
                  description={card.description}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Recent Complaints Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Paper
            sx={{
              p: { xs: 2.25, sm: 3 },
              borderRadius: 5,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(10,102,255,0.2)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2.5} gap={1.5} flexWrap="wrap">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  Recent Complaints
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
                  Latest issues reported across the network
                </Typography>
              </Box>
              <Button 
                size="small" 
                onClick={() => { window.location.href = '/admin'; }}
                sx={{ color: '#00C6FF', '&:hover': { color: '#0A66FF' } }}
              >
                View All →
              </Button>
            </Box>

            {loading ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>Loading complaints...</Typography>
              </Box>
            ) : complaints.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>No complaints found</Typography>
                <Button 
                  variant="contained" 
                  onClick={() => { window.location.href = '/submit'; }}
                  sx={{ mt: 2, borderRadius: '999px' }}
                >
                  Submit First Complaint
                </Button>
              </Box>
            ) : (
              <Box>
                {complaints.slice(0, 5).map((complaint, idx) => {
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
                        borderBottom: idx < 4 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#FFFFFF', textTransform: 'capitalize' }}>
                          #{complaint.id} - {complaint.complaint_type?.replace('_', ' ') || 'Complaint'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.5 }}>
                          {complaint.description?.substring(0, 100) || 'No description provided yet.'}
                        </Typography>
                        <Box display="flex" gap={1} mt={0.75} flexWrap="wrap">
                          <Chip
                            label={complaint.status || 'pending'}
                            size="small"
                            sx={{ bgcolor: statusStyle.bg, color: statusStyle.text, fontWeight: 600, fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={complaint.priority || 'medium'}
                            size="small"
                            sx={{ bgcolor: priorityStyle.bg, color: priorityStyle.text, fontWeight: 600, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 120 }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                          {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'Unknown date'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {complaint.latitude && complaint.longitude ? `${Number(complaint.latitude).toFixed(3)}, ${Number(complaint.longitude).toFixed(3)}` : 'Location pending'}
                        </Typography>
                      </Box>
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
