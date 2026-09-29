import { type LoginBody, Me, type RegisterBody, Session } from '@leftover/shared';
import { apiRequest, NoContent } from '../../../shared/api/client';

export const registerRequest = (body: RegisterBody) =>
  apiRequest('/auth/register', { method: 'POST', body, schema: Session });

export const loginRequest = (body: LoginBody) =>
  apiRequest('/auth/login', { method: 'POST', body, schema: Session });

export const logoutRequest = () =>
  apiRequest('/auth/logout', { method: 'POST', schema: NoContent });

export const meRequest = (signal?: AbortSignal) => apiRequest('/me', { schema: Me, signal });
