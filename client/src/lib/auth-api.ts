import api from './api';
import type { SignInValues, SignUpValues } from './validation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function signUp(values: SignUpValues): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/signup', values);
  return data;
}

export async function signIn(values: SignInValues): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/signin', values);
  return data;
}

export async function fetchProfile(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/profile');
  return data;
}
