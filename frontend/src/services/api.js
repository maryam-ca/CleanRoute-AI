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
  getComplaints: async () => {
    const token = getToken();
    const response = await fetch(API_BASE_URL + 'complaints/', {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    return response.json();
  },
  optimizeRoutes: async (area) => {
    const token = getToken();
    console.log('Optimizing routes for:', area);
    console.log('API URL:', API_BASE_URL + 'optimize-routes/');
    const response = await fetch(API_BASE_URL + 'optimize-routes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ area })
    });
    const data = await response.json();
    console.log('Optimize response:', data);
    return data;
  }
};

export default api;
