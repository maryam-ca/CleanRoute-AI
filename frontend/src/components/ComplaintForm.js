import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Stepper, Step, StepLabel,
  Grid, Card, CardContent, Chip, Alert, CircularProgress, IconButton
} from '@mui/material';
import {
  LocationOn, Upload as UploadIcon, Delete as DeleteIcon,
  CheckCircle, Warning, MyLocation
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const ComplaintForm = ({ token, user, setToken }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    complaint_type: 'overflowing',
    latitude: '',
    longitude: '',
    description: '',
    image: null,
    imagePreview: null
  });
  const [aiResult, setAiResult] = useState(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('complaint_type', formData.complaint_type);
    submitData.append('latitude', formData.latitude);
    submitData.append('longitude', formData.longitude);
    submitData.append('description', formData.description);
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
      toast.error('Failed to submit complaint');
    } finally {
      setLoading(false);
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
                    border: formData.complaint_type === type ? '2px solid #F97316' : '1px solid #ddd',
                    bgcolor: formData.complaint_type === type ? '#FFF3E0' : 'white'
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
            {formData.imagePreview && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <img src={formData.imagePreview} alt="Preview" style={{ width: '100%', borderRadius: 8 }} />
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                  onClick={() => setFormData({ ...formData, image: null, imagePreview: null })}
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
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#F97316', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>New Complaint</Typography>
          <Typography variant="caption">Report a waste issue to authorities</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
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
                sx={{ bgcolor: '#F97316' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext} sx={{ bgcolor: '#F97316' }}>
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
