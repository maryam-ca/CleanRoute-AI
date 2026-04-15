const API_BASE_URL = 'https://cleanroute-ai.onrender.com/api/';

const api = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', username);
        console.log('✅ Login successful, token saved');
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error' };
    }
  },

  getComplaints: async () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token exists:', !!token);
    
    if (!token) {
      console.error('No token found');
      return [];
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}complaints/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('📡 Complaints response status:', response.status);
      if (response.status === 401) {
        console.error('Token invalid, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/';
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.results || []);
    } catch (error) {
      console.error('Fetch error:', error);
      return [];
    }
  },

  getDashboardStats: async () => {
    const token = localStorage.getItem('token');
    if (!token) return {};
    try {
      const response = await fetch(`${API_BASE_URL}complaints/dashboard_stats/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    } catch (error) {
      return {};
    }
  },

  optimizeRoutes: async (area) => {
    const token = localStorage.getItem('token');
    console.log('🚀 Optimizing routes for:', area);
    console.log('🔑 Using token:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No token found');
      return { success: false, error: 'No token' };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}optimize-routes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ area })
      });
      console.log('📡 Optimize response status:', response.status);
      const data = await response.json();
      console.log('📊 Optimize data:', data);
      return data;
    } catch (error) {
      console.error('Optimize error:', error);
      return { success: false, error: error.message };
    }
  },

  getTesters: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}complaints/testers/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  assignToTester: async (complaintId, testerUsername) => {
    const token = localStorage.getItem('token');
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

  completeTask: async (complaintId, formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/complete_task/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  updateStatus: async (complaintId, status) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}complaints/${complaintId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  predictWaste: async (days) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}predict-waste/?days=${days}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export default api;
