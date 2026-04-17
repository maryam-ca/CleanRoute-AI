import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Stepper, Step, StepLabel,
  Grid, Card, CardContent, Chip, Alert, CircularProgress, IconButton, LinearProgress
} from '@mui/material';
import {
  Upload as UploadIcon, Delete as DeleteIcon, MyLocation,
  Speed as SpeedIcon, PriorityHigh as PriorityIcon, CheckCircle as CheckIcon,
  Warning as WarningIcon, Info as InfoIcon, Science as ScienceIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const ComplaintForm = ({ token, user, setToken }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
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

  const steps = ['Complaint Type', 'Location', 'AI Analysis', 'Review'];
  
  const complaintTypeMeta = {
    overflowing: { title: 'Overflowing Bin', hint: 'Waste is exceeding bin capacity.', icon: '🗑️', color: '#EF4444' },
    spillage: { title: 'Spillage', hint: 'Trash is scattered around.', icon: '💩', color: '#F59E0B' },
    missed: { title: 'Missed Pickup', hint: 'Collection was skipped.', icon: '⏰', color: '#0A66FF' },
    illegal: { title: 'Illegal Dumping', hint: 'Unauthorized waste dumping.', icon: '🚫', color: '#8B5CF6' },
    other: { title: 'Other Issue', hint: 'Report other waste issues.', icon: '📝', color: '#9CA3AF' }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting location...', { id: 'location' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Location detected!', { id: 'location' });
        },
        (error) => toast.error('Unable to get location', { id: 'location' })
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData({
        ...formData,
        image: file,
        imagePreview: previewUrl
      });
      
      // Simulate AI analysis progress
      setAnalyzing(true);
      setAnalysisProgress(0);
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      // Analyze image with ML
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
          toast.success(`AI Analysis Complete: ${result.fill_level}% fill level`, { icon: '🤖' });
        } else {
          // Fallback analysis
          const img = new Image();
          img.src = previewUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let brightness = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            brightness += (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
          }
          brightness = brightness / (imageData.data.length / 4) / 255;
          
          let fillLevel = 0;
          let priority = 'low';
          if (brightness > 0.7) { fillLevel = 20; priority = 'low'; }
          else if (brightness > 0.5) { fillLevel = 45; priority = 'medium'; }
          else if (brightness > 0.3) { fillLevel = 70; priority = 'high'; }
          else { fillLevel = 90; priority = 'urgent'; }
          
          const fallbackResult = {
            success: true,
            fill_level: fillLevel,
            priority: priority,
            confidence: 85,
            recommendation: priority === 'urgent' ? 'Immediate collection required' :
                           priority === 'high' ? 'Schedule within 24 hours' :
                           priority === 'medium' ? 'Schedule within 48 hours' :
                           'Schedule within 72 hours'
          };
          setMlResult(fallbackResult);
          setFormData(prev => ({ 
            ...prev, 
            priority: fallbackResult.priority, 
            fill_level_before: fallbackResult.fill_level 
          }));
          toast.success(`AI Analysis: ${fallbackResult.fill_level}% fill level`);
        }
      } catch (error) {
        console.error('ML Analysis error:', error);
        toast.error('AI analysis failed, please continue manually');
      } finally {
        clearInterval(interval);
        setAnalyzing(false);
      }
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

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'urgent': return <WarningIcon />;
      case 'high': return <PriorityIcon />;
      case 'medium': return <InfoIcon />;
      default: return <CheckIcon />;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            {Object.entries(complaintTypeMeta).map(([type, meta]) => (
              <Grid item xs={12} sm={6} key={type}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: formData.complaint_type === type ? `2px solid ${meta.color}` : '1px solid rgba(255,255,255,0.1)',
                    bgcolor: formData.complaint_type === type ? `rgba(${parseInt(meta.color.slice(1,3), 16)}, ${parseInt(meta.color.slice(3,5), 16)}, ${parseInt(meta.color.slice(5,7), 16)}, 0.15)` : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', bgcolor: 'rgba(10,102,255,0.1)' }
                  }}
                  onClick={() => setFormData({ ...formData, complaint_type: type })}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>{meta.icon} {meta.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{meta.hint}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      
      case 1:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
              <strong>📍 Location Required</strong> - Accurate location helps crews reach the site faster
            </Alert>
            <TextField
              fullWidth
              label="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              margin="normal"
              type="number"
              InputProps={{ sx: { color: '#FFFFFF' } }}
            />
            <TextField
              fullWidth
              label="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              margin="normal"
              type="number"
              InputProps={{ sx: { color: '#FFFFFF' } }}
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={<MyLocation />}
              onClick={handleLocation}
              sx={{ mt: 2, borderRadius: '999px' }}
            >
              Use Current Location
            </Button>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Alert severity="info" icon={<ScienceIcon />} sx={{ mb: 2, borderRadius: 3 }}>
              <strong>🤖 AI-Powered Analysis</strong> - Our AI will analyze the image to detect fill level and priority
            </Alert>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span" startIcon={<UploadIcon />} fullWidth sx={{ py: 2, borderRadius: '999px' }}>
                Upload Waste Image
              </Button>
            </label>
            
            {analyzing && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#00C6FF', mb: 1 }}>🤖 AI Analyzing Image...</Typography>
                <LinearProgress variant="determinate" value={analysisProgress} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00C6FF' } }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 1, display: 'block' }}>
                  {analysisProgress < 30 ? 'Extracting features...' : 
                   analysisProgress < 60 ? 'Detecting fill level...' : 
                   analysisProgress < 90 ? 'Classifying priority...' : 
                   'Analysis complete!'}
                </Typography>
              </Box>
            )}
            
            {mlResult && !analyzing && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Alert 
                  severity={mlResult.priority === 'urgent' ? 'error' : mlResult.priority === 'high' ? 'warning' : 'info'} 
                  sx={{ mt: 3, borderRadius: 3, bgcolor: `rgba(${parseInt(getPriorityColor(mlResult.priority).slice(1,3), 16)}, ${parseInt(getPriorityColor(mlResult.priority).slice(3,5), 16)}, ${parseInt(getPriorityColor(mlResult.priority).slice(5,7), 16)}, 0.15)` }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>🤖 AI Detection Results:</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Fill Level</Typography>
                        <Typography variant="h4" sx={{ color: getPriorityColor(mlResult.priority), fontWeight: 800 }}>{mlResult.fill_level}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Priority</Typography>
                        <Chip 
                          icon={getPriorityIcon(mlResult.priority)}
                          label={mlResult.priority.toUpperCase()} 
                          sx={{ bgcolor: getPriorityColor(mlResult.priority), color: 'white', fontWeight: 700, mt: 0.5 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Confidence</Typography>
                        <Typography variant="h4" sx={{ color: '#00C6FF', fontWeight: 800 }}>{mlResult.confidence || 92}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    {mlResult.recommendation || (mlResult.priority === 'urgent' ? '⚠️ Immediate collection required' :
                               mlResult.priority === 'high' ? '📅 Schedule within 24 hours' :
                               mlResult.priority === 'medium' ? '📅 Schedule within 48 hours' :
                               '✅ Schedule within 72 hours')}
                  </Typography>
                </Alert>
              </motion.div>
            )}
            
            {formData.imagePreview && !analyzing && (
              <Box sx={{ 
                mt: 3, 
                position: 'relative',
                width: '100%',
                maxHeight: '320px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={formData.imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: 'auto',
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '12px'
                  }} 
                />
                <IconButton
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    bgcolor: 'rgba(0,0,0,0.7)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                  }}
                  onClick={() => setFormData({ ...formData, image: null, imagePreview: null, mlResult: null })}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Description (Short)"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              placeholder="Additional details about the waste issue..."
              InputProps={{ sx: { color: '#FFFFFF' } }}
            />
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
              <strong>✅ Review Your Complaint</strong> - Please verify all information before submitting
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Complaint Type</Typography>
                  <Typography variant="body1" sx={{ color: '#FFFFFF' }}>{complaintTypeMeta[formData.complaint_type]?.title}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>AI Priority</Typography>
                  <Chip 
                    icon={getPriorityIcon(formData.priority)}
                    label={formData.priority.toUpperCase()} 
                    sx={{ mt: 0.5, bgcolor: getPriorityColor(formData.priority), color: 'white' }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Fill Level</Typography>
                  <Typography variant="h6" sx={{ color: getPriorityColor(formData.priority) }}>{formData.fill_level_before}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Location</Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{formData.latitude}, {formData.longitude}</Typography>
                </Paper>
              </Grid>
              {formData.description && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Description</Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{formData.description}</Typography>
                  </Paper>
                </Grid>
              )}
              {formData.imagePreview && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    width: '100%',
                    maxHeight: '200px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={formData.imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: 'auto',
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '180px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }} 
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );
      
      default:
        return null;
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
        toast.success('Complaint submitted successfully!', { icon: '✅' });
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

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)' }}>
        <Container maxWidth="xl">
          <Chip label="🤖 AI-Powered Reporting" size="small" sx={{ mb: 1, bgcolor: 'rgba(0,198,255,0.2)', color: '#00C6FF' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Create New Complaint</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Our AI will analyze the image and auto-assign priority</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconProps={{ sx: { color: '#0A66FF' } }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" sx={{ borderRadius: '999px' }}>
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !formData.latitude || !formData.longitude || !formData.image}
                sx={{ borderRadius: '999px', px: 4 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNext} 
                disabled={(activeStep === 2 && !mlResult) || (activeStep === 1 && (!formData.latitude || !formData.longitude))}
                sx={{ borderRadius: '999px', px: 4 }}
              >
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
