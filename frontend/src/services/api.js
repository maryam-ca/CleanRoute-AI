const API_BASE_URL = 'https://cleanroute-ai.onrender.com/api/';

const getToken = () => {
  return localStorage.getItem('token');
};

const api = {
  login: async (username, password) => {
    const response = await fetch(API_BASE_URL + 'token/', {
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

  createComplaint: async (formData) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/', {
      method: 'POST',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      body: formData
    });
    return response.json();
  },

  getComplaints: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return response.json();
  },

  getDashboardStats: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/dashboard_stats/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return response.json();
  },

  getTesters: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/testers/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return response.json();
  },

  assignToTester: async (complaintId, testerUsername) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/' + complaintId + '/assign_to_tester/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ tester_username: testerUsername })
    });
    return response.json();
  },

  completeTask: async (complaintId, formData) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/' + complaintId + '/complete_task/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    return response.json();
  },

  updateStatus: async (complaintId, status) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/' + complaintId + '/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  optimizeRoutes: async (area) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'optimize-routes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ area })
    });
    return response.json();
  },

  predictWaste: async (days) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'predict-waste/?days=' + days, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return response.json();
  }
};

export default api;
