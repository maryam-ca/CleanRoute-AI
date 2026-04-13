import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, Stepper, Step, StepLabel,
  Card, CardContent, Grid, IconButton, Avatar, LinearProgress,
  Chip, Alert, CircularProgress, useMediaQuery, useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  AutoAwesome as AiIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const ComplaintForm = ({ token, user, setToken }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    complaint_type: 'overflowing',
    description: '',
    latitude: '',
    longitude: '',
    priority: 'medium'
  });

  const steps = ['Type', 'Location', 'Photo & AI'];

  const complaintTypes = [
    { value: 'overflowing', label: 'Overflowing Bin', icon: '🗑️' },
    { value: 'spillage', label: 'Spillage', icon: '💧' },
    { value: 'missed', label: 'Missed Collection', icon: '🚛' },
    { value: 'illegal', label: 'Illegal Dumping', icon: '⚠️' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      await analyzeWithAI(file);
    }
  };

  const analyzeWithAI = async (file) => {
    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      const randomFill = Math.floor(Math.random() * 100);
      let priority = 'medium';
      if (randomFill >= 80) priority = 'urgent';
      else if (randomFill >= 60) priority = 'high';
      else if (randomFill >= 40) priority = 'medium';
      else priority = 'low';
      
      setAiAnalysis({
        fill_level: randomFill,
        priority: priority,
        confidence: 0.85,
        message: priority === 'urgent' ? 'URGENT: Bin is overflowing!' :
                 priority === 'high' ? 'HIGH: Bin is nearly full' :
                 priority === 'medium' ? 'MEDIUM: Bin partially filled' : 
                 'LOW: Bin has plenty of space'
      });
      setAnalyzing(false);
      setFormData(prev => ({ ...prev, priority: priority }));
      toast.success(`AI Analysis: ${priority.toUpperCase()} priority (${randomFill}% full)`);
    }, 1500);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAiAnalysis(null);
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.complaint_type) {
      toast.error('Please select a complaint type');
      return;
    }
    if (activeStep === 1 && (!formData.latitude || !formData.longitude)) {
      toast.error('Please provide location coordinates');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    console.log('=== SUBMITTING COMPLAINT ===');
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    if (!formData.description) {
      toast.error('Please provide description');
      return;
    }
    
    if (!selectedImage) {
      toast.error('Please upload a photo');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('complaint_type', formData.complaint_type);
      submitData.append('priority', formData.priority);
      submitData.append('latitude', parseFloat(formData.latitude));
      submitData.append('longitude', parseFloat(formData.longitude));
      submitData.append('description', formData.description);
      submitData.append('image', selectedImage);
      
      console.log('Submitting complaint...');
      const result = await api.createComplaint(submitData);
      console.log('Result:', result);
      
      if (result && result.id) {
        setSubmitted(true);
        toast.success(`✅ Complaint #${result.id} submitted! AI Priority: ${formData.priority.toUpperCase()}`);
        setTimeout(() => {
          navigate('/', { state: { refresh: true } });
        }, 2000);
      } else {
        toast.error(result?.error || 'Submission failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Submission failed');
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
          toast.success('Location detected');
        },
        () => toast.error('Unable to get location')
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const getPriorityColor = () => {
    switch(formData.priority) {
      case 'urgent': return '#EF5350';
      case 'high': return '#FFA726';
      case 'medium': return '#42A5F5';
      default: return '#66BB6A';
    }
  };

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Card sx={{ textAlign: 'center', p: { xs: 4, sm: 6 }, borderRadius: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#2E7D32', margin: '0 auto 20px' }}>
              <CheckIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>Complaint Submitted!</Typography>
            <Typography variant="body2" color="text.secondary">AI Priority: {formData.priority.toUpperCase()}</Typography>
          </Card>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: { xs: 2, sm: 4 } }}>
        <Container maxWidth="md">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
              <BackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Report Complaint</Typography>
            <Chip icon={<AiIcon />} label="AI-Powered" size="small" sx={{ bgcolor: '#4CAF50', color: 'white' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {activeStep === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography variant="h6" gutterBottom>Select Complaint Type</Typography>
                <Grid container spacing={2}>
                  {complaintTypes.map((type) => (
                    <Grid item xs={12} sm={6} key={type.value}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: formData.complaint_type === type.value ? '2px solid #2E7D32' : '1px solid',
                          borderColor: formData.complaint_type === type.value ? '#2E7D32' : 'divider',
                          bgcolor: formData.complaint_type === type.value ? 'action.selected' : 'background.paper',
                          transition: 'all 0.3s',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                        }}
                        onClick={() => setFormData({ ...formData, complaint_type: type.value })}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="h2">{type.icon}</Typography>
                            <Typography variant="subtitle1" fontWeight={600}>{type.label}</Typography>
                            {formData.complaint_type === type.value && <CheckIcon sx={{ color: '#2E7D32', ml: 'auto' }} />}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography variant="h6" gutterBottom>Location Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LocationIcon />}
                      onClick={getCurrentLocation}
                      sx={{ py: 1.5 }}
                    >
                      Use Current Location
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      value={formData.latitude}
                      onChange={handleChange('latitude')}
                      placeholder="e.g., 33.6844"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      value={formData.longitude}
                      onChange={handleChange('longitude')}
                      placeholder="e.g., 73.0479"
                    />
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography variant="h6" gutterBottom>Upload Photo & Submit</Typography>
                
                <Box sx={{ mb: 3 }}>
                  {!imagePreview ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{ py: 3, borderStyle: 'dashed' }}
                    >
                      Upload Photo for AI Analysis
                      <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    </Button>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 12 }} />
                      <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                        onClick={removeImage}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                  
                  {analyzing && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <CircularProgress size={30} sx={{ color: '#2E7D32' }} />
                      <Typography variant="caption" display="block">🤖 AI analyzing image...</Typography>
                    </Box>
                  )}
                  
                  {aiAnalysis && !analyzing && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>🤖 AI Analysis Result:</Typography>
                      <Typography variant="body2">• Priority: <strong style={{ color: getPriorityColor() }}>{aiAnalysis.priority.toUpperCase()}</strong></Typography>
                      <Typography variant="body2">• Fill Level: {aiAnalysis.fill_level}%</Typography>
                      <Typography variant="body2">• {aiAnalysis.message}</Typography>
                    </Alert>
                  )}
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Describe the issue..."
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Priority (AI Recommended)</InputLabel>
                  <Select value={formData.priority} onChange={handleChange('priority')} label="Priority (AI Recommended)">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
                
                {aiAnalysis && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                    🤖 AI Priority: {aiAnalysis.priority.toUpperCase()} | Fill Level: {aiAnalysis.fill_level}%
                  </Typography>
                )}
              </motion.div>
            )}

            <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !aiAnalysis}
                  sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#1976D2' }}>
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ComplaintForm;

