const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('current_user');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.errors && errorData.errors.length > 0) {
        throw new Error(errorData.errors[0].msg);
      }
      throw new Error(errorData?.message || 'API Error');
    }
    return response.json();
  },

  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (response.status === 401 || response.status === 403) {
      if (endpoint !== '/auth/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('current_user');
        window.location.href = '/';
      }
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.errors && errorData.errors.length > 0) {
        throw new Error(errorData.errors[0].msg);
      }
      throw new Error(errorData?.message || 'API Error');
    }
    return response.json();
  },

  async put(endpoint: string, data: unknown) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('current_user');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.errors && errorData.errors.length > 0) {
        throw new Error(errorData.errors[0].msg);
      }
      throw new Error(errorData?.message || 'API Error');
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('current_user');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
};
