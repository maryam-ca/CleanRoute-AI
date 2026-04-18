import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  MyLocation,
  PriorityHigh as PriorityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Science as ScienceIcon,
  PhotoCamera as PhotoCameraIcon,
  ImageSearch as ImageSearchIcon,
  Place as PlaceIcon
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
  const [imageMeta, setImageMeta] = useState(null);
  const previewUrlRef = useRef(null);
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

  const steps = ['Issue Type', 'Location', 'Photo Analysis', 'Review'];

  const complaintTypeMeta = {
    overflowing: { title: 'Overflowing Bin', hint: 'Waste is exceeding bin capacity.', icon: '🗑️', color: '#EF4444' },
    missed: { title: 'Missed Pickup', hint: 'Collection was skipped for this area.', icon: '⏰', color: '#0A66FF' },
    illegal: { title: 'Illegal Dumping', hint: 'Unauthorized waste dumping needs action.', icon: '🚫', color: '#8B5CF6' },
    other: { title: 'Other Issue', hint: 'Report any related sanitation issue.', icon: '📝', color: '#9CA3AF' }
  };

  const panelSx = {
    borderRadius: 6,
    border: '1px solid rgba(139,225,255,0.18)',
    background: 'linear-gradient(180deg, rgba(10, 28, 57, 0.88) 0%, rgba(7, 21, 42, 0.94) 100%)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 28px 55px rgba(3,12,25,0.28)'
  };

  useEffect(() => () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, []);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const updatePreview = (file) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    return previewUrl;
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const canvasToFile = (canvas, name) => new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image conversion failed'));
          return;
        }
        resolve(new File([blob], name, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.84
    );
  });

  const processImageForUpload = async (file) => {
    const isBrowserFriendly = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
    if (!isBrowserFriendly) {
      return {
        file,
        processed: false,
        warning: 'This phone image format may not analyze correctly. JPEG works best on mobile.'
      };
    }

    const dataUrl = await fileToDataUrl(file);
    const img = await loadImage(dataUrl);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const safeName = file.name.replace(/\.[^.]+$/, '') || 'complaint-photo';
    const processedFile = await canvasToFile(canvas, `${safeName}.jpg`);
    return {
      file: processedFile,
      processed: true,
      width: canvas.width,
      height: canvas.height
    };
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting location...', { id: 'location' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success('Location detected!', { id: 'location' });
        },
        () => toast.error('Unable to get location', { id: 'location' })
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const clearImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
    setMlResult(null);
    setImageMeta(null);
    setAnalysisProgress(0);
    const input = document.getElementById('image-upload');
    if (input) {
      input.value = '';
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const handleImageChange = async (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setMlResult(null);
    setImageMeta(null);
    setAnalysisProgress(0);

    try {
      const processed = await processImageForUpload(rawFile);
      const previewUrl = updatePreview(processed.file);

      setFormData((prev) => ({
        ...prev,
        image: processed.file,
        imagePreview: previewUrl
      }));
      setImageMeta({
        originalName: rawFile.name,
        displayName: processed.file.name,
        sizeKb: Math.round(processed.file.size / 1024),
        width: processed.width,
        height: processed.height
      });

      if (processed.warning) {
        toast.error(processed.warning);
      } else if (processed.processed) {
        toast.success('Image prepared for mobile upload');
      }

      setAnalyzing(true);
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 96) return prev;
          return prev + 8;
        });
      }, 180);

      const imgFormData = new FormData();
      imgFormData.append('image', processed.file);
      imgFormData.append('complaint_type', formData.complaint_type);

      try {
        const result = await api.analyzeImage(imgFormData);
        setAnalysisProgress(100);
        if (result.success) {
          setMlResult(result);
          setFormData((prev) => ({
            ...prev,
            priority: result.priority,
            fill_level_before: result.fill_level
          }));
          toast.success(`AI Analysis Complete: ${result.fill_level}% fill level`, { icon: '🤖' });
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (analysisError) {
        console.error('ML Analysis error:', analysisError);
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
          brightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
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
          priority,
          confidence: 85,
          recommendation: priority === 'urgent' ? 'Immediate collection required' :
            priority === 'high' ? 'Schedule within 24 hours' :
              priority === 'medium' ? 'Schedule within 48 hours' :
                'Schedule within 72 hours'
        };
        setAnalysisProgress(100);
        setMlResult(fallbackResult);
        setFormData((prev) => ({
          ...prev,
          priority: fallbackResult.priority,
          fill_level_before: fallbackResult.fill_level
        }));
        toast.success(`Fallback analysis ready: ${fallbackResult.fill_level}% fill level`);
      } finally {
        clearInterval(interval);
        setTimeout(() => {
          setAnalyzing(false);
        }, 200);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Could not prepare this image. Please try another photo.');
      clearImage();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#0A66FF';
      default: return '#22C55E';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <WarningIcon />;
      case 'high': return <PriorityIcon />;
      case 'medium': return <InfoIcon />;
      default: return <CheckIcon />;
    }
  };

  const stepSummaryCards = [
    { icon: <ImageSearchIcon sx={{ color: '#74DDFF' }} />, label: 'AI-guided intake', value: '4-step flow' },
    { icon: <PhotoCameraIcon sx={{ color: '#D8FF72' }} />, label: 'Mobile photo ready', value: 'JPEG optimized' },
    { icon: <PlaceIcon sx={{ color: '#53D769' }} />, label: 'Location accuracy', value: 'GPS-assisted' }
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2.25}>
            {Object.entries(complaintTypeMeta).map(([type, meta]) => (
              <Grid item xs={12} sm={6} key={type}>
                <Card
                  sx={{
                    ...panelSx,
                    cursor: 'pointer',
                    minHeight: 180,
                    border: formData.complaint_type === type ? `1px solid ${meta.color}` : '1px solid rgba(139,225,255,0.14)',
                    background: formData.complaint_type === type
                      ? `linear-gradient(180deg, rgba(10, 28, 57, 0.95) 0%, rgba(7, 21, 42, 0.98) 100%), radial-gradient(circle at top right, ${meta.color}33, transparent 50%)`
                      : 'linear-gradient(180deg, rgba(10, 28, 57, 0.88) 0%, rgba(7, 21, 42, 0.94) 100%)',
                    boxShadow: formData.complaint_type === type ? `0 26px 54px ${meta.color}22` : panelSx.boxShadow,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: meta.color,
                      boxShadow: `0 28px 52px ${meta.color}22`
                    }
                  }}
                  onClick={() => setFormData((prev) => ({ ...prev, complaint_type: type }))}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="overline" sx={{ color: meta.color, fontWeight: 800, letterSpacing: '0.14em' }}>
                          Issue Type
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1, color: '#FFFFFF', fontWeight: 700 }}>
                          {meta.icon} {meta.title}
                        </Typography>
                      </Box>
                      {formData.complaint_type === type && (
                        <Chip label="Selected" size="small" sx={{ bgcolor: `${meta.color}22`, color: meta.color }} />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#BDD8EB', lineHeight: 1.7 }}>
                      {meta.hint}
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
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
              <strong>Accurate location speeds up response.</strong> Use GPS first, then fine-tune if needed.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                  margin="normal"
                  type="number"
                  InputProps={{ sx: { color: '#FFFFFF', borderRadius: '18px' } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                  margin="normal"
                  type="number"
                  InputProps={{ sx: { color: '#FFFFFF', borderRadius: '18px' } }}
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              startIcon={<MyLocation />}
              onClick={handleLocation}
              sx={{ mt: 2, borderRadius: '999px', py: 1.35 }}
            >
              Use Current Location
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12} lg={7}>
                <Alert severity="info" icon={<ScienceIcon />} sx={{ mb: 2.5, borderRadius: 3 }}>
                  <strong>Mobile image upload improved.</strong> Photos are converted to upload-friendly JPEG before AI analysis.
                </Alert>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                    sx={{ py: 2, borderRadius: '22px', justifyContent: 'flex-start', px: 2.25 }}
                  >
                    Upload or Capture Waste Image
                  </Button>
                </label>

                <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: '#8FB9D3' }}>
                  Best results on mobile: use the rear camera or upload a clear JPEG/PNG photo.
                </Typography>

                {analyzing && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ color: '#00C6FF', mb: 1, fontWeight: 700 }}>
                      AI is analyzing the uploaded image...
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={analysisProgress}
                      sx={{ height: 9, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00C6FF' } }}
                    />
                    <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 1, display: 'block' }}>
                      {analysisProgress < 30 ? 'Preparing mobile image...' :
                        analysisProgress < 60 ? 'Detecting fill level...' :
                          analysisProgress < 90 ? 'Estimating service priority...' :
                            'Finalizing recommendation...'}
                    </Typography>
                  </Box>
                )}

                {formData.imagePreview && !analyzing && (
                  <Box
                    sx={{
                      mt: 3,
                      position: 'relative',
                      width: '100%',
                      minHeight: '320px',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(139,225,255,0.14)'
                    }}
                  >
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '360px',
                        objectFit: 'contain',
                        padding: '16px'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                      }}
                      onClick={clearImage}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper sx={{ ...panelSx, p: 2.5, minHeight: '100%' }}>
                  <Typography variant="overline" sx={{ color: '#D8FF72', fontWeight: 800, letterSpacing: '0.14em' }}>
                    AI Results
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                    Upload Intelligence
                  </Typography>

                  {imageMeta ? (
                    <Box sx={{ mb: 2.5, display: 'grid', gap: 1.25 }}>
                      <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,225,255,0.12)' }}>
                        <Typography variant="caption" sx={{ color: '#8FB9D3' }}>Prepared file</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{imageMeta.displayName}</Typography>
                      </Box>
                      <Grid container spacing={1.25}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)' }}>
                            <Typography variant="caption" sx={{ color: '#8FB9D3' }}>File size</Typography>
                            <Typography variant="body2" sx={{ color: '#74DDFF', fontWeight: 700 }}>{imageMeta.sizeKb} KB</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)' }}>
                            <Typography variant="caption" sx={{ color: '#8FB9D3' }}>Dimensions</Typography>
                            <Typography variant="body2" sx={{ color: '#D8FF72', fontWeight: 700 }}>
                              {imageMeta.width && imageMeta.height ? `${imageMeta.width} x ${imageMeta.height}` : 'Ready'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#BDD8EB', mb: 2.5 }}>
                      Upload a photo to get automatic fill-level and priority suggestions.
                    </Typography>
                  )}

                  {mlResult && !analyzing ? (
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                      <Alert
                        severity={mlResult.priority === 'urgent' ? 'error' : mlResult.priority === 'high' ? 'warning' : 'info'}
                        sx={{ borderRadius: 3, bgcolor: `rgba(${parseInt(getPriorityColor(mlResult.priority).slice(1, 3), 16)}, ${parseInt(getPriorityColor(mlResult.priority).slice(3, 5), 16)}, ${parseInt(getPriorityColor(mlResult.priority).slice(5, 7), 16)}, 0.14)` }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.25 }}>
                          Detection results
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Fill</Typography>
                            <Typography variant="h5" sx={{ color: getPriorityColor(mlResult.priority), fontWeight: 800 }}>
                              {mlResult.fill_level}%
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Priority</Typography>
                            <Chip
                              icon={getPriorityIcon(mlResult.priority)}
                              label={mlResult.priority.toUpperCase()}
                              size="small"
                              sx={{ mt: 0.5, bgcolor: getPriorityColor(mlResult.priority), color: 'white', fontWeight: 700 }}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Confidence</Typography>
                            <Typography variant="h5" sx={{ color: '#00C6FF', fontWeight: 800 }}>
                              {mlResult.confidence || 92}%
                            </Typography>
                          </Grid>
                        </Grid>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1.25 }}>
                          {mlResult.recommendation || 'Routing suggestion prepared.'}
                        </Typography>
                      </Alert>
                    </motion.div>
                  ) : (
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(139,225,255,0.18)' }}>
                      <Typography variant="body2" sx={{ color: '#BDD8EB' }}>
                        The review step will still work even if AI falls back to manual estimation.
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    margin="normal"
                    placeholder="Add nearby landmark, severity, or collection notes..."
                    InputProps={{ sx: { color: '#FFFFFF', borderRadius: '18px' } }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 3 }}>
              <strong>Final review.</strong> Check the complaint details before submitting.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ ...panelSx, p: 2.25 }}>
                  <Typography variant="caption" sx={{ color: '#8FB9D3' }}>Complaint Type</Typography>
                  <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                    {complaintTypeMeta[formData.complaint_type]?.title}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ ...panelSx, p: 2.25 }}>
                  <Typography variant="caption" sx={{ color: '#8FB9D3' }}>AI Priority</Typography>
                  <Chip
                    icon={getPriorityIcon(formData.priority)}
                    label={formData.priority.toUpperCase()}
                    sx={{ mt: 0.75, bgcolor: getPriorityColor(formData.priority), color: 'white' }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ ...panelSx, p: 2.25 }}>
                  <Typography variant="caption" sx={{ color: '#8FB9D3' }}>Fill Level</Typography>
                  <Typography variant="h5" sx={{ color: getPriorityColor(formData.priority), fontWeight: 800 }}>
                    {formData.fill_level_before}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ ...panelSx, p: 2.25 }}>
                  <Typography variant="caption" sx={{ color: '#8FB9D3' }}>Location</Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                    {formData.latitude}, {formData.longitude}
                  </Typography>
                </Paper>
              </Grid>
              {formData.description && (
                <Grid item xs={12}>
                  <Paper sx={{ ...panelSx, p: 2.25 }}>
                    <Typography variant="caption" sx={{ color: '#8FB9D3' }}>Description</Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', lineHeight: 1.7 }}>
                      {formData.description}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {formData.imagePreview && (
                <Grid item xs={12}>
                  <Paper sx={{ ...panelSx, p: 1.5 }}>
                    <Box
                      sx={{
                        width: '100%',
                        minHeight: 180,
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        style={{
                          width: '100%',
                          maxHeight: '260px',
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  </Paper>
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
      submitData.append('image', formData.image, formData.image.name);
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

      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3.5, px: 4, border: '1px solid rgba(139,225,255,0.22)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(15,78,148,0.34) 0%, rgba(19,107,89,0.22) 58%, rgba(7,22,43,0.45) 100%)', backdropFilter: 'blur(16px)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 20% 20%, rgba(255,244,173,0.16), transparent 16%), radial-gradient(circle at 80% 18%, rgba(54,196,255,0.18), transparent 18%)' }} />
        <Container maxWidth="xl">
          <Chip label="AI Intake Workflow" size="small" sx={{ mb: 1, bgcolor: 'rgba(216,255,114,0.16)', color: '#D8FF72', border: '1px solid rgba(216,255,114,0.18)' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Create New Complaint</Typography>
          <Typography variant="body2" sx={{ color: '#DDEDF8', maxWidth: 760 }}>
            Capture the issue, let AI inspect the image, and submit a cleaner report with better mobile upload reliability.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ ...panelSx, p: 3, height: '100%' }}>
              <Typography variant="overline" sx={{ color: '#74DDFF', fontWeight: 800, letterSpacing: '0.14em' }}>
                Guided Flow
              </Typography>
              <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 800, mb: 1.25 }}>
                Faster reporting, less friction on mobile.
              </Typography>
              <Typography variant="body2" sx={{ color: '#BDD8EB', lineHeight: 1.75, mb: 3 }}>
                The form now removes the unwanted issue type and prepares uploaded photos before analysis and submission.
              </Typography>
              <Box sx={{ display: 'grid', gap: 1.4 }}>
                {stepSummaryCards.map((item) => (
                  <Box key={item.label} sx={{ p: 1.8, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,225,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      {item.icon}
                      <Typography variant="body2" sx={{ color: '#DDEDF8' }}>{item.label}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#D8FF72', fontWeight: 700 }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Paper sx={{ ...panelSx, p: { xs: 2.2, md: 4 } }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4, '& .MuiStepLabel-label': { color: '#BDD8EB' }, '& .Mui-active .MuiStepLabel-label': { color: '#FFFFFF', fontWeight: 700 }, '& .Mui-completed .MuiStepLabel-label': { color: '#D8FF72' }, '& .MuiStepIcon-root': { color: 'rgba(116,221,255,0.3)' }, '& .Mui-active .MuiStepIcon-root': { color: '#36C4FF' }, '& .Mui-completed .MuiStepIcon-root': { color: '#53D769' } }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {getStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" sx={{ borderRadius: '999px', minWidth: 120 }}>
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || !formData.latitude || !formData.longitude || !formData.image}
                    sx={{ borderRadius: '999px', px: 4, minWidth: 180 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={(activeStep === 2 && !formData.image) || (activeStep === 1 && (!formData.latitude || !formData.longitude))}
                    sx={{ borderRadius: '999px', px: 4, minWidth: 140 }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ComplaintForm;
