import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, AUTH_COOKIE_NAME } from '@/lib/constants';
import { getCookie, deleteCookie } from '@/lib/cookies';
import { ApiError } from '@/types';

/**
 * The one and only Axios instance in the app (requirement #2). Every API
 * call - auth and products - goes through this file's interceptors, so
 * token injection and error normalization happen in exactly one place.
 */
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor: attach the bearer token automatically. Reading the
// cookie here (rather than passing it in from components) is what lets UI
// code call `productApi.getProducts()` without ever thinking about auth.
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCookie(AUTH_COOKIE_NAME);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: normalize every failure into a plain ApiError
// object so components never have to know Axios exists. Also centralizes
// the "token expired/invalid -> log the user out" behavior (requirement:
// handle expired/invalid tokens gracefully).
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    if (status === 401) {
      deleteCookie(AUTH_COOKIE_NAME);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const apiError: ApiError = {
      status,
      message: resolveMessage(error, status),
    };

    return Promise.reject(apiError);
  }
);

function resolveMessage(error: AxiosError<{ message?: string }>, status?: number): string {
  if (axios.isCancel(error)) return 'Request cancelled.';
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error.response) return 'Network error. Check your connection and try again.';
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 404) return 'The requested resource was not found.';
  if (status && status >= 500) return 'Something went wrong on the server. Please try again.';
  return error.response.data?.message || 'Something went wrong. Please try again.';
}

export default axiosClient;
