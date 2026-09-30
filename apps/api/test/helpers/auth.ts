import { env } from 'cloudflare:test';
import { type Role, Session } from '@leftover/shared';
import app from '../../src/index';

export const uniqueEmail = (tag = 'user') => `${tag}-${crypto.randomUUID()}@example.com`;

export const jsonRequest = (path: string, method: string, body?: unknown, token?: string) =>
  app.request(
    path,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    env,
  );

/** Registers a fresh user and returns its session. */
export const registerUser = async (role: Role = 'customer', password = 'leftover24') => {
  const res = await jsonRequest('/auth/register', 'POST', {
    role,
    firstName: 'Olena',
    email: uniqueEmail(role),
    password,
  });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${await res.text()}`);
  return Session.parse(await res.json());
};
