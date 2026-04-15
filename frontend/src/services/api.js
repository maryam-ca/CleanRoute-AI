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
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  optimizeRoutes: async (area) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}optimize-routes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ area })
    });
    return response.json();
  },

  getComplaints: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}complaints/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export default api;
