import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Button, CircularProgress, Avatar,
  LinearProgress, Paper, IconButton, Tooltip, useMediaQuery, useTheme
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
  DeleteSweep as CleanIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const Dashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF5350';
      case 'high': return '#FFA726';
      case 'medium': return '#42A5F5';
      default: return '#66BB6A';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckIcon sx={{ fontSize: 14, color: '#66BB6A' }} />;
      case 'assigned': return <PendingIcon sx={{ fontSize: 14, color: '#42A5F5' }} />;
      default: return <WarningIcon sx={{ fontSize: 14, color: '#FFA726' }} />;
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
    { name: 'Overflowing', value: 35, color: '#FFA726' },
    { name: 'Spillage', value: 25, color: '#42A5F5' },
    { name: 'Missed', value: 20, color: '#EF5350' },
    { name: 'Illegal', value: 12, color: '#AB47BC' },
    { name: 'Other', value: 8, color: '#66BB6A' },
  ];

  const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: color, fontSize: { xs: '1.75rem', sm: '2.5rem' } }}>
                {value}
              </Typography>
              {trend && !isMobile && (
                <Box display="flex" alignItems="center" mt={1}>
                  {trend > 0 ? <TrendingUpIcon sx={{ fontSize: 14, color: '#66BB6A' }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: '#EF5350' }} />}
                  <Typography variant="caption" color={trend > 0 ? '#66BB6A' : '#EF5350'} sx={{ ml: 0.5 }}>
                    {trendValue}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: `${color}15`, color: color, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const filteredComplaints = complaints.filter(c =>
    c.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Welcome Section */}
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Welcome back, {user || 'User'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Here's what's happening with your waste management system today.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="TOTAL" value={stats?.total_complaints || 0} icon={<CleanIcon />} color="#2E7D32" trend={12} trendValue="+12%" />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="PENDING" value={stats?.pending_complaints || 0} icon={<PendingIcon />} color="#FFA726" trend={-5} trendValue="-5%" />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="ASSIGNED" value={stats?.assigned_complaints || 0} icon={<SpeedIcon />} color="#42A5F5" trend={8} trendValue="+8%" />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="COMPLETED" value={stats?.completed_complaints || 0} icon={<CheckIcon />} color="#66BB6A" trend={15} trendValue="+15%" />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Weekly Trends
                </Typography>
                <Box sx={{ height: { xs: 250, sm: 350 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="complaintGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis dataKey="day" stroke="#9E9E9E" tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <YAxis stroke="#9E9E9E" tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <ReTooltip />
                      <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                      <Area type="monotone" dataKey="complaints" stroke="#2E7D32" strokeWidth={2} fill="url(#complaintGradient)" name="New" />
                      <Line type="monotone" dataKey="resolved" stroke="#42A5F5" strokeWidth={2} name="Resolved" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  By Type
                </Typography>
                <Box sx={{ height: { xs: 200, sm: 280 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={isMobile ? 40 : 60} outerRadius={isMobile ? 60 : 90} dataKey="value" label={!isMobile}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Complaints Table */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Recent ({complaints.length})
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                  }}
                  sx={{ minWidth: isMobile ? 150 : 200 }}
                />
                <Button size={isMobile ? "small" : "medium"} variant="contained" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading}>
                  Refresh
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#2E7D32' }} />
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading...</Typography>
              </Box>
            ) : complaints.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="text.secondary">No complaints found.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      {!isMobile && <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>}
                      <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      {!isMobile && <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>}
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredComplaints.slice(0, isMobile ? 5 : 10).map((complaint) => (
                      <TableRow key={complaint.id} hover>
                        <TableCell>#{complaint.id}</TableCell>
                        {!isMobile && <TableCell>{complaint.complaint_type}</TableCell>}
                        <TableCell>
                          <Chip label={complaint.priority} size="small" sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {getStatusIcon(complaint.status)}
                            {!isMobile && <Typography variant="body2" textTransform="capitalize">{complaint.status || 'pending'}</Typography>}
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                              {complaint.latitude?.toFixed(2)}, {complaint.longitude?.toFixed(2)}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
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
      </Container>
    </Box>
  );
};

export default Dashboard;
