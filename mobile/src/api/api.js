const API_BASE = 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
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
export const initiatePurchase = (payload, token) => request('/payments/initiate', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } });
export const verifyPurchase = (payload, token) => request('/payments/verify', { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${token}` } });
export const fetchTransactions = (token) => authorizedRequest('/transactions/me', token);

export const authorizedRequest = (path, token, options = {}) => {
  return request(path, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
};
