// API Service for CleanRoute-AI
const API_URL = 'http://localhost:8000/api/';

const api = {
  // Authentication
  login: async (username, password) => {
    const response = await fetch(`${API_URL}token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Complaints
  getComplaints: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}complaints/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch complaints');
    return response.json();
  },

  createComplaint: async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}complaints/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to create complaint');
    return response.json();
  },

  completeTask: async (id, formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}complaints/${id}/complete_task/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  },

  assignComplaint: async (id, testerUsername) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}complaints/${id}/assign/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tester_username: testerUsername })
    });
    if (!response.ok) throw new Error('Failed to assign complaint');
    return response.json();
  },

  getDashboardStats: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}complaints/dashboard_stats/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getAnomalies: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}anomalies/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch anomalies');
    return response.json();
  },

  optimizeRoutes: async (area) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}optimize-routes/`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ area })
    });
    if (!response.ok) throw new Error('Failed to optimize routes');
    return response.json();
  },

  getWastePrediction: async (days = 7) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}ml/predict-waste/?days=${days}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch predictions');
    return response.json();
  },

  analyzeImage: async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}analyze-image/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) throw new Error('AI analysis failed');
    return response.json();
  }
};

export default api;
