import { moneyInputText, parseMoneyInput } from './money-input';

describe('parseMoneyInput', () => {
  it.each([
    ['149', 14900],
    ['149.5', 14950],
    ['149,50', 14950],
    [' 0.05 ', 5],
    ['3480', 348000],
  ])('%p → %p kopiyky', (text, minor) => {
    expect(parseMoneyInput(text)).toBe(minor);
  });

  it.each(['', 'abc', '1.234', '-5', '1e3', '₴149'])('rejects %p', (text) => {
    expect(parseMoneyInput(text)).toBeNull();
  });
});

describe('moneyInputText', () => {
  it('shows whole hryvnias plainly and kopiyky with two digits', () => {
    expect(moneyInputText(14900)).toBe('149');
    expect(moneyInputText(14950)).toBe('149.50');
    expect(moneyInputText(5)).toBe('0.05');
  });
});

describe('money input in Oman (OMR, 3 decimals)', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_MARKET = 'OM';
  });
  afterEach(() => {
    process.env.EXPO_PUBLIC_MARKET = 'UA';
  });

  it.each([
    ['1.5', 1500],
    ['1.500', 1500],
    ['4', 4000],
    ['0,250', 250],
    ['١٫٥', 1500],
    ['٤', 4000],
  ])('%p → %p baisa', (text, minor) => {
    expect(parseMoneyInput(text)).toBe(minor);
  });

  it.each(['1.2345', 'OMR 1', ''])('rejects %p', (text) => {
    expect(parseMoneyInput(text)).toBeNull();
  });

  it('starts a price field with three decimals', () => {
    expect(moneyInputText(1500)).toBe('1.500');
    expect(moneyInputText(4000)).toBe('4.000');
  });
});
