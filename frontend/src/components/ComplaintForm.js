import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Stepper, Step, StepLabel,
  Grid, Card, CardContent, Chip, Alert, CircularProgress, IconButton
} from '@mui/material';
import {
  Upload as UploadIcon, Delete as DeleteIcon, MyLocation
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const ComplaintForm = ({ token, user, setToken }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    complaint_type: 'overflowing',
    latitude: '',
    longitude: '',
    description: '',
    image: null,
    imagePreview: null,
    priority: 'medium',
    fill_level_before: 50
  });

  const steps = ['Complaint Type', 'Location', 'Photo & Description', 'Review'];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Location detected!');
        },
        (error) => toast.error('Unable to get location')
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
      
      // Analyze image with ML
      setAnalyzing(true);
      const imgFormData = new FormData();
      imgFormData.append('image', file);
      imgFormData.append('complaint_type', formData.complaint_type);
      
      try {
        const result = await api.analyzeImage(imgFormData);
        if (result.success) {
          setMlResult(result);
          setFormData(prev => ({ 
            ...prev, 
            priority: result.priority, 
            fill_level_before: result.fill_level 
          }));
          toast.success(`AI detected: ${result.fill_level}% fill level - ${result.priority.toUpperCase()} priority`);
        } else {
          toast.error(result.error || 'AI analysis failed');
        }
      } catch (error) {
        console.error('ML Analysis error:', error);
        toast.error(error.message || 'AI analysis failed');
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('complaint_type', formData.complaint_type);
    submitData.append('latitude', formData.latitude);
    submitData.append('longitude', formData.longitude);
    submitData.append('description', formData.description);
    submitData.append('priority', formData.priority);
    submitData.append('fill_level_before', formData.fill_level_before);
    if (formData.image) {
      submitData.append('image', formData.image);
    }
    
    try {
      const response = await api.createComplaint(submitData);
      if (response.id || response.success) {
        toast.success('Complaint submitted successfully!');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        toast.error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#93C5FD';
      case 'high': return '#60A5FA';
      case 'medium': return '#3B82F6';
      default: return '#BFDBFE';
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            {['overflowing', 'spillage', 'missed', 'illegal', 'other'].map((type) => (
              <Grid item xs={6} sm={4} key={type}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: formData.complaint_type === type ? '1px solid rgba(125, 176, 255, 0.4)' : '1px solid rgba(148, 163, 184, 0.14)',
                    bgcolor: formData.complaint_type === type ? 'rgba(79, 140, 255, 0.12)' : 'transparent'
                  }}
                  onClick={() => setFormData({ ...formData, complaint_type: type })}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" textTransform="capitalize">{type}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      
      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              margin="normal"
              type="number"
            />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MyLocation />}
              onClick={handleLocation}
              sx={{ mt: 2 }}
            >
              Use Current Location
            </Button>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />} fullWidth>
                Upload Photo
              </Button>
            </label>
            
            {analyzing && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
                <Typography variant="caption" display="block">AI analyzing image...</Typography>
              </Box>
            )}
            
            {mlResult && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">🤖 AI Detection Results:</Typography>
                <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                  <Chip 
                    label={`Fill Level: ${mlResult.fill_level}%`}
                    sx={{ bgcolor: getPriorityColor(mlResult.priority), color: 'white' }}
                  />
                  <Chip 
                    label={`Priority: ${mlResult.priority.toUpperCase()}`}
                    sx={{ bgcolor: getPriorityColor(mlResult.priority), color: 'white' }}
                  />
                  <Chip 
                    label={`Confidence: ${mlResult.confidence}%`}
                    sx={{ bgcolor: '#6B7280', color: 'white' }}
                  />
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {mlResult.recommendation}
                </Typography>
              </Alert>
            )}
            
            {formData.imagePreview && !analyzing && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <img src={formData.imagePreview} alt="Preview" style={{ width: '100%', borderRadius: 8 }} />
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(8, 14, 26, 0.75)' }}
                  onClick={() => setFormData({ ...formData, image: null, imagePreview: null, imageFile: null })}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              placeholder="Describe the waste issue..."
            />
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review your complaint before submitting
            </Alert>
            <Typography variant="subtitle2">Type: {formData.complaint_type}</Typography>
            <Typography variant="subtitle2">Priority: {formData.priority.toUpperCase()}</Typography>
            <Typography variant="subtitle2">Fill Level: {formData.fill_level_before}%</Typography>
            <Typography variant="subtitle2">Location: {formData.latitude}, {formData.longitude}</Typography>
            <Typography variant="subtitle2">Description: {formData.description || 'Not provided'}</Typography>
            {formData.imagePreview && (
              <Box sx={{ mt: 1 }}>
                <img src={formData.imagePreview} alt="Preview" style={{ width: 100, borderRadius: 8 }} />
              </Box>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
<<<<<<< HEAD
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh' }}>
=======
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', pt: '110px' }}>
>>>>>>> final-updates
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, color: 'white', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(79, 140, 255, 0.16) 0%, rgba(15, 23, 42, 0.18) 100%)' }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>New Complaint</Typography>
          <Typography variant="caption">Report a waste issue to authorities</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 6 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !formData.latitude || !formData.longitude}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ComplaintForm;

