const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || '/api';

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const buildUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const getStoredToken = () =>
  localStorage.getItem('token') || localStorage.getItem('access_token');

export const authHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeError = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  const message =
    data?.detail ||
    data?.error ||
    data?.message ||
    `Request failed with status ${response.status}`;

  const error = new Error(message);
  error.response = { data, status: response.status };
  throw error;
};

const request = async (path, options = {}) => {
  const { headers = {}, body, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    await normalizeError(response);
  }

  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();
  return { data, status: response.status };
};

const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
  login: async (username, password) => {
    const response = await request('/token/', {
      method: 'POST',
      headers: {},
      body: { username, password },
    });

    if (response.data?.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      localStorage.setItem('user', response.data.username || username);
      if (response.data.role) {
        localStorage.setItem('user_role', response.data.role);
      }
    }

    return response.data;
  },
  optimizeRoutes: async (area) => {
    const response = await request('/optimize-routes/', {
      method: 'POST',
      body: { area },
    });
    return response.data;
  },
};

export const authAPI = {
  login: (username, password) => request('/token/', {
    method: 'POST',
    headers: {},
    body: { username, password },
  }),
  register: (payload) => request('/register/', {
    method: 'POST',
    headers: {},
    body: payload,
  }),
  refresh: (refresh) => request('/token/refresh/', {
    method: 'POST',
    headers: {},
    body: { refresh },
  }),
};

export default api;
