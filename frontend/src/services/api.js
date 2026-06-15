export const API_BASE_URL = '/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Try refreshing token
    if (endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('token', data.token);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            
            // Retry original request
            const newHeaders = { ...headers, 'Authorization': `Bearer ${data.token}` };
            const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers: newHeaders,
            });
            
            if (retryRes.ok) {
              const text = await retryRes.text();
              return text ? JSON.parse(text) : {};
            }
          }
        } catch (err) {
          console.error("Token refresh failed", err);
        }
      }
    }

    // Token expired or invalid, and refresh failed
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Something went wrong' };
    }
    throw new Error(errorData.message || 'API Request Failed');
  }

  // Handle 204 No Content or empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};
