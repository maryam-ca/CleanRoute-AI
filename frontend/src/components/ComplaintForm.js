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
  const complaintTypeMeta = {
    overflowing: { title: 'Overflowing Bin', hint: 'Waste is exceeding bin capacity.' },
    spillage: { title: 'Spillage', hint: 'Trash is scattered around the collection point.' },
    missed: { title: 'Missed Pickup', hint: 'Collection was skipped on schedule.' },
    illegal: { title: 'Illegal Dumping', hint: 'Waste has been dumped in an unauthorized area.' },
    other: { title: 'Other Issue', hint: 'Report anything that does not fit the main categories.' }
  };

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
              <Grid item xs={12} sm={6} key={type}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: formData.complaint_type === type ? '1px solid rgba(125, 176, 255, 0.4)' : '1px solid rgba(148, 163, 184, 0.14)',
                    bgcolor: formData.complaint_type === type ? 'rgba(79, 140, 255, 0.12)' : 'transparent',
                    minHeight: '100%',
                    boxShadow: formData.complaint_type === type ? '0 20px 36px rgba(47, 123, 246, 0.14)' : 'none'
                  }}
                  onClick={() => setFormData({ ...formData, complaint_type: type })}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fbff' }}>
                      {complaintTypeMeta[type].title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.75, color: '#8ea2c0' }}>
                      {complaintTypeMeta[type].hint}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#94a9c8' }}>
              Add the exact location so the cleanup crew can reach the site without delay.
            </Typography>
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
              sx={{ mt: 2.5 }}
            >
              Use Current Location
            </Button>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#94a9c8' }}>
              Add a clear photo and short note. The AI will estimate severity automatically.
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />} fullWidth sx={{ py: 1.5 }}>
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
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review your complaint before submitting
            </Alert>
            <Paper sx={{ p: 2.25, borderRadius: 4 }}>
              <Typography variant="caption">Type</Typography>
              <Typography variant="subtitle2">{complaintTypeMeta[formData.complaint_type]?.title || formData.complaint_type}</Typography>
            </Paper>
            <Paper sx={{ p: 2.25, borderRadius: 4 }}>
              <Typography variant="caption">Priority</Typography>
              <Typography variant="subtitle2">{formData.priority.toUpperCase()}</Typography>
            </Paper>
            <Paper sx={{ p: 2.25, borderRadius: 4 }}>
              <Typography variant="caption">Fill Level</Typography>
              <Typography variant="subtitle2">{formData.fill_level_before}%</Typography>
            </Paper>
            <Paper sx={{ p: 2.25, borderRadius: 4 }}>
              <Typography variant="caption">Location</Typography>
              <Typography variant="subtitle2">{formData.latitude}, {formData.longitude}</Typography>
            </Paper>
            <Paper sx={{ p: 2.25, borderRadius: 4 }}>
              <Typography variant="caption">Description</Typography>
              <Typography variant="subtitle2">{formData.description || 'Not provided'}</Typography>
            </Paper>
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
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', pt: '110px' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, py: { xs: 3, md: 4 }, px: { xs: 2.25, md: 4 }, color: 'white', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 6, background: 'radial-gradient(circle at top right, rgba(100, 213, 255, 0.16), transparent 28%), linear-gradient(135deg, rgba(79, 140, 255, 0.16) 0%, rgba(15, 23, 42, 0.18) 100%)' }}>
        <Container maxWidth="xl">
          <Chip label="Citizen Reporting" size="small" sx={{ mb: 1.25, bgcolor: 'rgba(94, 162, 255, 0.16)', color: '#dce8ff', fontWeight: 700 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', sm: '2rem' } }}>Create a new complaint</Typography>
          <Typography variant="body2" sx={{ mt: 0.75, maxWidth: 560 }}>Share the issue, confirm the exact location, and let the system prioritize the cleanup automatically.</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Paper sx={{ p: { xs: 2.25, md: 4 }, borderRadius: 6 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 120 } }}>
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !formData.latitude || !formData.longitude}
                sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 180 } }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 120 } }}>
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


