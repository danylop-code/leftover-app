import { stockTone } from './stock-tone';

describe('stockTone', () => {
  it('is out at 0, low at 1–2, normal above', () => {
    expect(stockTone(0)).toBe('out');
    expect(stockTone(1)).toBe('low');
    expect(stockTone(2)).toBe('low');
    expect(stockTone(3)).toBe('stock');
  });
});
