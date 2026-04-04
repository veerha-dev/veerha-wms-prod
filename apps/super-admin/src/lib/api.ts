import axios from 'axios';
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/sa`;
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('sa_token');
  if (t) c.headers.Authorization = "Bearer " + t;
  return c;
});
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401) { localStorage.removeItem('sa_token'); window.location.href = '/login'; }
  return Promise.reject(e);
});
export default api;
export const setToken = (t: string) => localStorage.setItem('sa_token', t);
export const clearToken = () => localStorage.removeItem('sa_token');
export const getToken = () => localStorage.getItem('sa_token');
