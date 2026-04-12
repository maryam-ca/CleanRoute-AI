const API_BASE_URL = 'http://127.0.0.1:8001/api/';

const api = {
  // Auth
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },
  
  // Complaints
  getComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}complaints/`);
    return response.json();
  },
  
  createComplaint: async (data) => {
    const options = { method: 'POST' };
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE_URL}complaints/`, options);
    return response.json();
  },
  
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}complaints/dashboard_stats/`);
    return response.json();
  },
  
  getTesters: async () => {
    const response = await fetch(`${API_BASE_URL}complaints/testers/`);
    return response.json();
  },
  
  assignToTester: async (complaintId, testerUsername) => {
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/assign_to_tester/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tester_username: testerUsername })
    });
    return response.json();
  },
  
  markCompleted: async (complaintId, formData) => {
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/mark_completed/`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  
  updateStatus: async (complaintId, status) => {
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/update_status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },
  
  // Analytics
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}complaints/analytics/`);
    return response.json();
  },
  
  // Route Optimization
  optimizeRoutes: async (area) => {
    const response = await fetch(`${API_BASE_URL}optimize-routes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area })
    });
    return response.json();
  },
  
  // Waste Prediction
  predictWaste: async (days) => {
    const response = await fetch(`${API_BASE_URL}predict-waste/?days=${days}`);
    return response.json();
  }
};

export default api;
