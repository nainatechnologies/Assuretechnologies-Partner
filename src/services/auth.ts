export interface AuthUser {
  id: number;
  email?: string;
  role: string;
  full_name?: string;
  mobile?: string;
}

export const loginUser = (user: AuthUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("user");
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("user");
};

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch (e) {
    return null;
  }
};

import api from './api';

export const requestPasswordResetOtp = async (mobile: string) => {
  const response = await api.post('/auth/partner/forgot-password', { mobile });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await api.post('/auth/partner/reset-password', data);
  return response.data;
};
