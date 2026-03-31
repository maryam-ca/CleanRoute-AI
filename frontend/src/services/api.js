import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const submitComplaint = async (formData) => {
    return await api.post('/submit-complaint/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const optimizeRoutes = async (locations) => {
    return await api.post('/optimize-routes/', { locations });
};

export const predictWaste = async () => {
    return await api.get('/predict-waste/');
};

export default api;