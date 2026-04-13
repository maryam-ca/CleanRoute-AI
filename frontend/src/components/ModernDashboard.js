import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Button, CircularProgress, Avatar,
  useTheme, IconButton, Tooltip, LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Speed as SpeedIcon,
  DeleteSweep as CleanIcon,
  Analytics as AnalyticsIcon,
  Assignment as TaskIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import CountUp from 'react-countup';
import api from '../services/api';

const ModernDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

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
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const trendData = [
    { day: 'Mon', complaints: 12, resolved: 8 },
    { day: 'Tue', complaints: 15, resolved: 10 },
    { day: 'Wed', complaints: 18, resolved: 14 },
    { day: 'Thu', complaints: 14, resolved: 12 },
    { day: 'Fri', complaints: 20, resolved: 16 },
    { day: 'Sat', complaints: 10, resolved: 8 },
    { day: 'Sun', complaints: 8, resolved: 6 },
  ];

  const pieData = [
    { name: 'Overflowing', value: 35, color: '#F59E0B' },
    { name: 'Spillage', value: 25, color: '#3B82F6' },
    { name: 'Missed', value: 20, color: '#2E7D32' },
    { name: 'Illegal', value: 12, color: '#8B5CF6' },
    { name: 'Other', value: 8, color: '#2E7D32' },
  ];

  const StatCard = ({ title, value, icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card sx={{ 
        overflow: 'hidden',
        position: 'relative',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: color }}>
                <CountUp end={value} duration={2} separator="," />
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
        <LinearProgress 
          variant="determinate" 
          value={Math.min((value / (stats?.total_complaints || 1)) * 100, 100)} 
          sx={{ height: 3, bgcolor: `${color}20`, '& .MuiLinearProgress-bar': { bgcolor: color } }}
        />
      </Card>
    </motion.div>
  );

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#2E7D32';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#2E7D32';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckIcon sx={{ fontSize: 14, color: '#2E7D32' }} />;
      case 'assigned': return <PendingIcon sx={{ fontSize: 14, color: '#F59E0B' }} />;
      default: return <WarningIcon sx={{ fontSize: 14, color: '#2E7D32' }} />;
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
        color: 'white',
        pt: 6,
        pb: 8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Welcome back, {user || 'User'}! 👋
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Here's what's happening with your waste management system today.
            </Typography>
          </motion.div>
        </Container>
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4, pb: 6 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="TOTAL COMPLAINTS" value={stats?.total_complaints || 0} icon={<CleanIcon />} color="#2E7D32" delay={0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="PENDING" value={stats?.pending_complaints || 0} icon={<PendingIcon />} color="#F59E0B" delay={1} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="ASSIGNED" value={stats?.assigned_complaints || 0} icon={<TaskIcon />} color="#3B82F6" delay={2} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="COMPLETED" value={stats?.completed_complaints || 0} icon={<DoneAllIcon />} color="#8B5CF6" delay={3} />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    📈 Weekly Complaint Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="complaintGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <ReTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Area type="monotone" dataKey="complaints" stroke="#2E7D32" strokeWidth={2} fill="url(#complaintGradient)" name="New Complaints" />
                      <Area type="monotone" dataKey="resolved" stroke="#3B82F6" strokeWidth={2} fill="none" name="Resolved" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    🥧 Complaints by Type
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Complaints Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  📋 Recent Complaints ({complaints.length})
                </Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>,
                    }}
                    sx={{ minWidth: 250 }}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<RefreshIcon />} 
                    onClick={fetchData} 
                    disabled={loading}
                    sx={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>

              {loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <CircularProgress sx={{ color: '#2E7D32' }} />
                  <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading complaints...</Typography>
                </Box>
              ) : complaints.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="text.secondary">No complaints found. Submit your first complaint!</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredComplaints.slice(0, 10).map((complaint, idx) => (
                        <motion.tr
                          key={complaint.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          style={{ borderBottom: '1px solid #E5E7EB' }}
                        >
                          <TableCell>#{complaint.id}</TableCell>
                          <TableCell>
                            <Chip label={complaint.complaint_type} size="small" sx={{ bgcolor: '#F5F5F5', color: '#1B5E20' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={complaint.priority} size="small" sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getStatusIcon(complaint.status)}
                              <Typography variant="body2" textTransform="capitalize">{complaint.status || 'pending'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(complaint.created_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ModernDashboard;



