import axiosClient from './axiosClient';
import { AuthResponse } from '@/types';

export const authApi = {
  login: (username: string, password: string) =>
    axiosClient
      .post<AuthResponse>('/auth/login', {
        username,
        password,
        expiresInMins: 60,
      })
      .then((res) => res.data),

  me: (signal?: AbortSignal) =>
    axiosClient.get('/auth/me', { signal }).then((res) => res.data),
};
