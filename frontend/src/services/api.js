const API_BASE_URL = 'https://cleanroute-ai.onrender.com/api/';

const getToken = () => {
  return localStorage.getItem('token');
};

const parseResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error ||
      data?.detail ||
      (typeof data === 'string' ? data : 'Request failed');
    throw new Error(message);
  }

  return data;
};

const api = {
  login: async (username, password) => {
    const response = await fetch(API_BASE_URL + 'token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await parseResponse(response);
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
    return parseResponse(response);
  },

  getComplaints: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return parseResponse(response);
  },

  getDashboardStats: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/dashboard_stats/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return parseResponse(response);
  },

  getTesters: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/testers/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return parseResponse(response);
  },

  analyzeImage: async (formData) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'analyze-image/', {
      method: 'POST',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      body: formData
    });
    return parseResponse(response);
  },

  getAnomalies: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'anomalies/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return parseResponse(response);
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
    return parseResponse(response);
  },

  completeTask: async (complaintId, formData) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/' + complaintId + '/complete_task/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    return parseResponse(response);
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
    return parseResponse(response);
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
    return parseResponse(response);
  },

  predictWaste: async (days) => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'predict-waste/?days=' + days, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return parseResponse(response);
  }
};

export default api;


