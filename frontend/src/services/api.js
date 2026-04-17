// API Service for CleanRoute-AI
const API_URL = 'http://localhost:8000/api/';

const api = {
  // Authentication
  login: async (username, password) => {
    const response = await fetch(API_URL + 'token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Get complaints
  getComplaints: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'complaints/', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Failed to fetch complaints');
    return response.json();
  },

  // Get my tasks (for testers)
  getMyTasks: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'complaints/my_tasks/', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Failed to fetch my tasks');
    return response.json();
  },

  // Create complaint
  createComplaint: async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'complaints/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to create complaint');
    return response.json();
  },

  // Complete task
  completeTask: async (id, formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'complaints/' + id + '/complete_task/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  },

  // Assign complaint to tester
  assignComplaint: async (id, testerUsername) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'complaints/' + id + '/assign/', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tester_username: testerUsername })
    });
    if (!response.ok) throw new Error('Failed to assign complaint');
    return response.json();
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'complaints/dashboard_stats/', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Get anomalies
  getAnomalies: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'anomalies/', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Failed to fetch anomalies');
    return response.json();
  },

  // Optimize routes
  optimizeRoutes: async (area) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'ml/optimize-routes/', {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ area: area })
    });
    if (!response.ok) throw new Error('Failed to optimize routes');
    return response.json();
  },

  // Get waste prediction
  getWastePrediction: async (days) => {
    const token = localStorage.getItem('token');
    const daysNum = days || 7;
    const response = await fetch(API_URL + 'ml/predict-waste/?days=' + daysNum, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Failed to fetch predictions');
    return response.json();
  },

  // Analyze image
  analyzeImage: async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'analyze-image/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    if (!response.ok) throw new Error('AI analysis failed');
    return response.json();
  },
  autoAssign: async (complaintId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL + 'complaints/auto_assign/', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ complaint_id: complaintId })
    });
    if (!response.ok) throw new Error('Failed to auto-assign');
    return response.json();
  }
};

export default api;


