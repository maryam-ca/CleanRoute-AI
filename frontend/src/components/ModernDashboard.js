import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Button, CircularProgress, Avatar,
  useTheme, LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  DeleteSweep as CleanIcon,
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

  // Chart Data
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
    { name: 'Overflowing', value: 35, color: '#60A5FA' },
    { name: 'Spillage', value: 25, color: '#3B82F6' },
    { name: 'Missed', value: 20, color: '#93C5FD' },
    { name: 'Illegal', value: 12, color: '#2563EB' },
    { name: 'Other', value: 8, color: '#BFDBFE' },
    { name: 'Overflowing', value: 35, color: '#60A5FA' },
    { name: 'Spillage', value: 25, color: '#3B82F6' },
    { name: 'Missed', value: 20, color: '#93C5FD' },
    { name: 'Illegal', value: 12, color: '#2563EB' },
    { name: 'Other', value: 8, color: '#BFDBFE' },
  ];

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const assigned = complaints.filter(c => c.status === 'assigned').length;
  const completed = complaints.filter(c => c.status === 'completed').length;
  const closed = complaints.filter(c => c.status === 'closed').length;

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
        background: `linear-gradient(135deg, ${color}16 0%, rgba(15, 23, 42, 0.16) 100%)`,
        border: `1px solid ${color}22`,
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
          value={Math.min((value / (total || 1)) * 100, 100)} 
          sx={{ height: 3, bgcolor: `${color}20`, '& .MuiLinearProgress-bar': { bgcolor: color } }}
        />
      </Card>
    </motion.div>
  );

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#93C5FD';
      case 'high': return '#60A5FA';
      case 'medium': return '#3B82F6';
      default: return '#BFDBFE';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckIcon sx={{ fontSize: 14, color: '#93C5FD' }} />;
      case 'assigned': return <PendingIcon sx={{ fontSize: 14, color: '#60A5FA' }} />;
      case 'closed': return <DoneAllIcon sx={{ fontSize: 14, color: '#6B7280' }} />;
      default: return <WarningIcon sx={{ fontSize: 14, color: '#7DB0FF' }} />;
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', pt: '110px' }}>
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(79, 140, 255, 0.16) 0%, rgba(15, 23, 42, 0.18) 100%)',
        color: 'white',
        pt: 5,
        pb: 6,
        mx: { xs: 2, md: 3 },
        border: '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Welcome back, {user || 'User'}! 🚀
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Real-time analytics and intelligent route optimization
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 0, pb: 6 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 5, mt: -3 }}>
          <Grid item xs={6} sm={3} md={2.4}>
            <StatCard title="TOTAL" value={total} icon={<CleanIcon />} color="#60A5FA" delay={0} />
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <StatCard title="PENDING" value={pending} icon={<PendingIcon />} color="#93C5FD" delay={1} />
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <StatCard title="ASSIGNED" value={assigned} icon={<TaskIcon />} color="#3B82F6" delay={2} />
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <StatCard title="COMPLETED" value={completed} icon={<CheckIcon />} color="#7DB0FF" delay={3} />
          </Grid>
          <Grid item xs={6} sm={3} md={2.4}>
            <StatCard title="CLOSED" value={closed} icon={<DoneAllIcon />} color="#6B7280" delay={4} />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card sx={{ borderRadius: 4, overflow: 'visible' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    📈 Weekly Complaint Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="complaintGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <ReTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Area type="monotone" dataKey="complaints" stroke="#60A5FA" strokeWidth={2} fill="url(#complaintGradient)" name="New Complaints" />
                      <Area type="monotone" dataKey="resolved" stroke="#BFDBFE" strokeWidth={2} fill="none" name="Resolved" />
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
          <Card sx={{ borderRadius: 4, overflow: 'visible' }}>
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
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    sx={{ minWidth: 250 }}
                  />
                  <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained">
                    Refresh
                  </Button>
                </Box>
              </Box>

              {loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress sx={{ color: '#4f8cff' }} /></Box>
              ) : complaints.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}><Typography>No complaints found</Typography></Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Submitted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredComplaints.slice(0, 10).map((complaint, idx) => (
                        <TableRow key={complaint.id} hover>
                          <TableCell>#{complaint.id}</TableCell>
                          <TableCell>
                            <Chip label={complaint.complaint_type} size="small" sx={{ bgcolor: 'rgba(96, 165, 250, 0.12)', color: '#dce8ff' }} />
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
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(complaint.created_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
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



