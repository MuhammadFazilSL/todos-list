import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types';

export const useAuthQuery = () => {
  const { login } = useAuth();

  const loginMutation = useMutation<
    AuthResponse,
    Error,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
    },
  });

  const registerMutation = useMutation<
    AuthResponse,
    Error,
    { email: string; password: string; displayName: string }
  >({
    mutationFn: async (userData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
    },
  });

  return {
    loginMutation,
    registerMutation,
  };
};
