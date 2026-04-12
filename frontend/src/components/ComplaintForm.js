import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, Grid, IconButton, Avatar, LinearProgress, Chip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const ComplaintForm = ({ token, user, setToken }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    complaint_type: 'overflowing',
    description: '',
    latitude: '',
    longitude: '',
    priority: 'high'
  });

  const complaintTypes = [
    { value: 'overflowing', label: 'Overflowing Bin' },
    { value: 'spillage', label: 'Spillage' },
    { value: 'missed', label: 'Missed Collection' },
    { value: 'illegal', label: 'Illegal Dumping' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      toast.success('Photo uploaded');
    }
  };

    const analyzeWithAI = async (file) => {
    setAnalyzing(true);
    // Simulate AI analysis (in production, this would call backend)
    setTimeout(() => {
      // Random but realistic analysis based on file size/type
      const randomFill = Math.floor(Math.random() * 100);
      let priority = 'medium';
      if (randomFill >= 80) priority = 'urgent';
      else if (randomFill >= 60) priority = 'high';
      else if (randomFill >= 40) priority = 'medium';
      else priority = 'low';
      
      setAiAnalysis({
        fill_level: randomFill,
        priority: priority,
        confidence: 0.85 + Math.random() * 0.1,
        message: randomFill >= 80 ? 'URGENT: Bin is overflowing!' : 
                 randomFill >= 60 ? 'HIGH: Bin is nearly full' :
                 randomFill >= 40 ? 'MEDIUM: Bin partially filled' : 
                 'LOW: Bin has plenty of space'
      });
      setAnalyzing(false);
      // Auto-set priority
      setFormData(prev => ({ ...prev, priority: priority }));
      toast.success(`AI Analysis: ${priority.toUpperCase()} priority (${randomFill}% full)`);
    }, 1500);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.description) {
      toast.error('Please provide description');
      return;
    }
    
    if (!selectedImage) {
      toast.error('Please upload a photo');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please provide location');
      return;
    }
    
    setLoading(true);
    try {
      // Create FormData without user field
      const submitData = new FormData();
      submitData.append('complaint_type', formData.complaint_type);
      submitData.append('priority', formData.priority);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      submitData.append('description', formData.description);
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }
      
      console.log('Submitting:', {
        complaint_type: formData.complaint_type,
        priority: formData.priority,
        latitude: formData.latitude,
        longitude: formData.longitude
      });
      
      const result = await api.createComplaint(submitData, token);
      console.log('Result:', result);
      
      if (result && result.id) {
        setSubmitted(true);
        toast.success(`✅ Complaint #${result.id} submitted!`);
        setTimeout(() => {
          navigate('/', { state: { refresh: true } });
        }, 2000);
      } else {
        toast.error(result?.detail || result?.error || "Submission failed");
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Submission failed");
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

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F1F8E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Paper sx={{ textAlign: 'center', p: 6, borderRadius: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#4CAF50', margin: '0 auto 20px' }}>
              <CheckIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h5">Complaint Submitted!</Typography>
            <Typography variant="body2" color="textSecondary">Thank you for reporting</Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="md">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
              <BackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Report Complaint</Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Complaint Type</InputLabel>
                  <Select value={formData.complaint_type} onChange={handleChange('complaint_type')} label="Complaint Type">
                    {complaintTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
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
                  placeholder="33.6844"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.longitude}
                  onChange={handleChange('longitude')}
                  placeholder="73.0479"
                />
              </Grid>
              
              <Grid item xs={12}>
                {!imagePreview ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{ py: 3, borderStyle: 'dashed' }}
                  >
                    Upload Photo
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
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Describe the issue..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formData.priority} onChange={handleChange('priority')} label="Priority">
                    {priorityOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ bgcolor: '#4CAF50', py: 1.5 }}
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ComplaintForm;


