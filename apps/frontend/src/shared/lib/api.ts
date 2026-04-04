// API Client - Supports both mock API and real backend
import axios, { AxiosInstance } from 'axios';
import { mockApi } from '@/mocks/services/mockApi.service';
import type { ApiResponse, PaginatedResponse } from '@veerha/shared-types';

const ACCESS_TOKEN_KEY = 'wms_access_token';
const REFRESH_TOKEN_KEY = 'wms_refresh_token';

// Configuration: Set to 'real' to use backend, 'mock' for mock data
const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create real axios instance
const realApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth interceptor for real API
realApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor with 401 handling
realApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens();
      localStorage.removeItem('wms_mock_user');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Export the appropriate API based on mode
export const api = API_MODE === 'real' ? realApi : mockApi;

// Log which API mode is active
if (import.meta.env.DEV) {
  console.log(`🔌 API Mode: ${API_MODE}${API_MODE === 'real' ? ` (${API_BASE_URL})` : ''}`);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function apiUnwrap<T>(response: { data: ApiResponse<T> }): { data: T; meta?: Record<string, any> } {
  return { data: response.data.data, meta: response.data.meta };
}

// Re-export shared types for convenience
export type { ApiResponse, PaginatedResponse };
