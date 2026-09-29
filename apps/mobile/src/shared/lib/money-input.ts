import { minorPerMajor } from '@leftover/shared';
import { activeMarket } from '../constants/market';

// Arabic keyboards type Arabic-Indic digits and the Arabic decimal separator.
const ARABIC_INDIC_ZERO = 0x0660;
const ARABIC_DECIMAL_SEPARATOR = '\u066B';
const MAX_MAJOR_DIGITS = 6;

const toWesternDigits = (text: string) =>
  text
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - ARABIC_INDIC_ZERO))
    .replaceAll(ARABIC_DECIMAL_SEPARATOR, '.');

/**
 * An amount typed by a person → integer minor units of the market's currency, at the input
 * edge. OMR: "1.5" → 1500, "1,250" → 1250. UAH: "149" → 14900, "149,50" → 14950.
 * Null for anything that isn't a plain amount (or has more decimals than the currency).
 */
export const parseMoneyInput = (text: string): number | null => {
  const { currency } = activeMarket();
  const pattern = new RegExp(`^\\d{1,${MAX_MAJOR_DIGITS}}(?:[.,]\\d{1,${currency.minorDigits}})?$`);
  const trimmed = toWesternDigits(text.trim());
  if (!pattern.test(trimmed)) return null;
  const [major, fraction = ''] = trimmed.replace(',', '.').split('.');
  return (
    Number(major) * minorPerMajor(currency) + Number(fraction.padEnd(currency.minorDigits, '0'))
  );
};

/** Minor units → the text a price field starts with: OMR 1500 → "1.500"; UAH 14900 → "149". */
export const moneyInputText = (minor: number): string => {
  const { currency } = activeMarket();
  const perMajor = minorPerMajor(currency);
  const major = Math.floor(minor / perMajor);
  const rest = minor % perMajor;
  return rest || currency.alwaysShowMinor
    ? `${major}.${String(rest).padStart(currency.minorDigits, '0')}`
    : String(major);
};
