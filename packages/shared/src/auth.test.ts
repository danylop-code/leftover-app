import { describe, expect, it } from 'vitest';
import { LoginBody, Me, RegisterBody, Session } from './index';

const valid = {
  role: 'customer',
  firstName: 'Olena',
  email: 'Olena.M@Example.com ',
  password: 'leftover24',
};

describe('RegisterBody', () => {
  it('normalises the email to trimmed lowercase', () => {
    expect(RegisterBody.parse(valid).email).toBe('olena.m@example.com');
  });

  it('requires a password of at least 8 characters', () => {
    expect(RegisterBody.safeParse({ ...valid, password: '1234567' }).success).toBe(false);
    expect(RegisterBody.safeParse({ ...valid, password: '12345678' }).success).toBe(true);
  });

  it('requires a first name of 1–40 characters', () => {
    expect(RegisterBody.safeParse({ ...valid, firstName: '' }).success).toBe(false);
    expect(RegisterBody.safeParse({ ...valid, firstName: '   ' }).success).toBe(false);
    expect(RegisterBody.safeParse({ ...valid, firstName: 'x'.repeat(41) }).success).toBe(false);
    expect(RegisterBody.parse({ ...valid, firstName: ' Olena ' }).firstName).toBe('Olena');
  });

  it('accepts only customer or store roles', () => {
    expect(RegisterBody.safeParse({ ...valid, role: 'store' }).success).toBe(true);
    expect(RegisterBody.safeParse({ ...valid, role: 'admin' }).success).toBe(false);
  });

  it('rejects invalid emails', () => {
    expect(RegisterBody.safeParse({ ...valid, email: 'olena@' }).success).toBe(false);
  });
});

describe('LoginBody', () => {
  it('normalises the email and requires a password', () => {
    expect(LoginBody.parse({ email: ' A@B.CO ', password: 'x' }).email).toBe('a@b.co');
    expect(LoginBody.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('Session', () => {
  it('pairs a token with Me', () => {
    const me = {
      id: 'u1',
      email: 'a@b.co',
      firstName: 'A',
      role: 'store',
      createdAt: '2026-09-29T10:00:00.000Z',
      storeId: null,
    };
    expect(Session.parse({ token: 't', user: me })).toEqual({ token: 't', user: me });
    expect(Me.parse(me)).toEqual(me);
  });
});

describe('Me', () => {
  it('carries the owned store id (null until shop setup)', () => {
    const base = {
      id: 'u1',
      email: 'a@b.co',
      firstName: 'A',
      role: 'store',
      createdAt: '2026-09-29T10:00:00.000Z',
    };
    expect(Me.parse({ ...base, storeId: 's1' }).storeId).toBe('s1');
    expect(Me.safeParse(base).success).toBe(false);
  });
});
