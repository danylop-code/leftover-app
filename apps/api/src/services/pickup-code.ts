const CODE_SPACE = 10_000;
const CODE_DIGITS = 4;
const MAX_ATTEMPTS = 50;

/** Codes must be unique among a shop's reserved orders from this many hours back. */
export const CODE_WINDOW_HOURS = 24;

/**
 * A random 4-digit pickup code nobody in `taken` holds (leading zeros kept). Retries on
 * collision; throws if it can't find one (a shop would need thousands of open orders).
 */
export const pickCode = (taken: ReadonlySet<string>, random: () => number = Math.random) => {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = String(Math.floor(random() * CODE_SPACE)).padStart(CODE_DIGITS, '0');
    if (!taken.has(code)) return code;
  }
  throw new Error('Could not find a free pickup code');
};
