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
