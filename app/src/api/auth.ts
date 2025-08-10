import { api } from './client';

export type LoginResponse = { access_token: string; refresh_token?: string };

export async function login(email: string, password: string): Promise<LoginResponse> {
  return api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export async function register(email: string, password: string): Promise<{ message: string } | LoginResponse> {
  return api('/auth/register', { method: 'POST', body: { email, password } });
}
