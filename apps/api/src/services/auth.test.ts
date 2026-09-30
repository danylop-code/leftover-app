import { describe, expect, it } from 'vitest';
import { generateToken, hashPassword, hashToken, PBKDF2_ITERATIONS, verifyPassword } from './auth';

describe('password hashing', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const stored = await hashPassword('leftover24');
    expect(await verifyPassword('leftover24', stored)).toBe(true);
    expect(await verifyPassword('leftover25', stored)).toBe(false);
  });

  it('uses PBKDF2-SHA256 at 100k iterations with a per-hash salt', async () => {
    // 100k is both the brief's minimum and the deployed Workers maximum.
    expect(PBKDF2_ITERATIONS).toBe(100_000);
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).toMatch(/^pbkdf2-sha256\$100000\$[\w-]+\$[\w-]+$/);
    expect(a).not.toBe(b);
  });

  it('never verifies a malformed or placeholder hash', async () => {
    expect(await verifyPassword('x', '!seed-no-login')).toBe(false);
    expect(await verifyPassword('x', 'pbkdf2-sha256$1$bad')).toBe(false);
  });
});

describe('session tokens', () => {
  it('are 32 random bytes, base64url', () => {
    const t = generateToken();
    expect(t).toMatch(/^[\w-]{43}$/);
    expect(generateToken()).not.toBe(t);
  });

  it('hash deterministically to SHA-256 hex', async () => {
    const h = await hashToken('abc');
    expect(h).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(await hashToken('abc')).toBe(h);
  });
});
