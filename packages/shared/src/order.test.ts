import { describe, expect, it } from 'vitest';
import { CreateOrderBody, deriveOrderStatus, MAX_QTY_PER_ORDER, orderNumber } from './index';

describe('CreateOrderBody', () => {
  it('accepts 1 to MAX_QTY_PER_ORDER bags', () => {
    expect(MAX_QTY_PER_ORDER).toBe(5);
    expect(CreateOrderBody.parse({ bagId: 'b1', qty: 1 })).toEqual({ bagId: 'b1', qty: 1 });
    expect(CreateOrderBody.parse({ bagId: 'b1', qty: 5 }).qty).toBe(5);
  });

  it.each([
    ['zero', { bagId: 'b1', qty: 0 }],
    ['more than the maximum', { bagId: 'b1', qty: 6 }],
    ['a fraction', { bagId: 'b1', qty: 1.5 }],
    ['no bag', { qty: 1 }],
    ['an empty bag id', { bagId: '', qty: 1 }],
  ])('rejects %s', (_name, body) => {
    expect(CreateOrderBody.safeParse(body).success).toBe(false);
  });
});

describe('deriveOrderStatus', () => {
  const window = { pickupStart: '2026-09-29T15:00:00.000Z', pickupEnd: '2026-09-29T16:30:00.000Z' };
  const at = (iso: string) => new Date(iso);

  it.each([
    ['before the window', '2026-09-29T14:59:59.999Z', 'reserved'],
    ['exactly at the start', '2026-09-29T15:00:00.000Z', 'ready'],
    ['inside', '2026-09-29T16:00:00.000Z', 'ready'],
    ['a moment before the end', '2026-09-29T16:29:59.999Z', 'ready'],
    ['exactly at the end', '2026-09-29T16:30:00.000Z', 'missed'],
    ['after', '2026-09-30T08:00:00.000Z', 'missed'],
  ])('a reserved order %s is %s', (_name, now, expected) => {
    expect(deriveOrderStatus({ status: 'reserved', ...window }, at(now))).toBe(expected);
  });

  it.each(['collected', 'cancelled'] as const)('%s stays %s whatever the time', (status) => {
    expect(deriveOrderStatus({ status, ...window }, at('2026-09-29T15:30:00.000Z'))).toBe(status);
    expect(deriveOrderStatus({ status, ...window }, at('2026-09-30T15:30:00.000Z'))).toBe(status);
  });
});

describe('orderNumber', () => {
  it('is LF- plus five digits, stable per id', () => {
    expect(orderNumber('c7a1f7e2-1234')).toMatch(/^LF-\d{5}$/);
    expect(orderNumber('c7a1f7e2-1234')).toBe(orderNumber('c7a1f7e2-1234'));
    expect(orderNumber('a')).not.toBe(orderNumber('b'));
  });
});
