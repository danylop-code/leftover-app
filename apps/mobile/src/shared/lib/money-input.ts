import { MINOR_PER_MAJOR } from '../constants/money';

const MONEY_INPUT = /^\d{1,6}(?:[.,]\d{1,2})?$/;

/**
 * Hryvnias typed by a person → integer kopiyky, at the input edge: "149" → 14900,
 * "149.5" / "149,50" → 14950. Null for anything that isn't a plain amount.
 */
export const parseMoneyInput = (text: string): number | null => {
  const trimmed = text.trim();
  if (!MONEY_INPUT.test(trimmed)) return null;
  const [major, fraction = ''] = trimmed.replace(',', '.').split('.');
  return Number(major) * MINOR_PER_MAJOR + Number(fraction.padEnd(2, '0'));
};

/** Kopiyky → the text a price field starts with: 14900 → "149", 14950 → "149.50". */
export const moneyInputText = (minor: number): string => {
  const major = Math.floor(minor / MINOR_PER_MAJOR);
  const rest = minor % MINOR_PER_MAJOR;
  return rest ? `${major}.${String(rest).padStart(2, '0')}` : String(major);
};
