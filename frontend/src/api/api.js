const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API error');
  return data;
};

export const login = (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
export const register = (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
export const fetchBooks = () => request('/books');
export const fetchBookById = (id) => request(`/books/${id}`);
export const createBook = (formData, token) => authorizedRequest('/books', token, { method: 'POST', body: formData });
export const initiatePurchase = (payload, token) => authorizedRequest('/payments/initiate', token, { method: 'POST', body: JSON.stringify(payload) });
export const verifyPurchase = (payload, token) => authorizedRequest('/payments/verify', token, { method: 'POST', body: JSON.stringify(payload) });
export const getPaymentProviders = (token) => authorizedRequest('/payments/providers', token);
export const getPurchaseHistory = (token) => authorizedRequest('/transactions/me', token);
export const downloadBook = (bookId, tokenValue, token) => authorizedRequest(`/transactions/download/${bookId}?token=${encodeURIComponent(tokenValue)}`, token);
export const getAdminBooks = (token) => authorizedRequest('/admin/books?status=pending', token);
export const updateBookStatus = (bookId, status, token) => authorizedRequest(`/admin/books/${bookId}/status`, token, { method: 'PUT', body: JSON.stringify({ status }) });
export const getAuthorAnalytics = (token) => authorizedRequest('/transactions/author/me', token);

export const authorizedRequest = async (path, token, options = {}) => {
  const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
  return request(path, { ...options, headers });
};
