const API_BASE_URL = 'http://127.0.0.1:8001/api/';

const getToken = () => {
  return localStorage.getItem('token');
};

const api = {
  // Auth
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.access) {
      localStorage.setItem('token', data.access);
      localStorage.setItem('user', username);
    }
    return data;
  },
  
  // Complaints
  getComplaints: async () => {
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}complaints/`, { headers });
    return response.json();
  },
  
  createComplaint: async (data) => {
    const token = getToken();
    const options = { method: 'POST' };
    
    if (token) {
      options.headers = { 'Authorization': `Bearer ${token}` };
    }
    
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers = { ...options.headers, 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}complaints/`, options);
    return response.json();
  },
  
  getDashboardStats: async () => {
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}complaints/dashboard_stats/`, { headers });
    return response.json();
  },
  
  getTesters: async () => {
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}complaints/testers/`, { headers });
    return response.json();
  },
  
  assignToTester: async (complaintId, testerUsername) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/assign_to_tester/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tester_username: testerUsername })
    });
    return response.json();
  },
  
  completeByTester: async (complaintId, formData) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/complete_by_tester/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },
  
  updateStatus: async (complaintId, status) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/update_status/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  },
  
  getAnalytics: async () => {
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}complaints/analytics/`, { headers });
    return response.json();
  },
  
  optimizeRoutes: async (area) => {
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}optimize-routes/`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ area })
    });
    return response.json();
  },
  
  predictWaste: async (days) => {
    const token = getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}predict-waste/?days=${days}`, { headers });
    return response.json();
  }
};

export default api;
