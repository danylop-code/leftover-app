// The only source of "now" for services, so tests can freeze time.
let frozen: number | null = null;

export const now = (): Date => new Date(frozen ?? Date.now());

export const nowIso = (): string => now().toISOString();

/** Tests only: pin `now()` to an instant. */
export const freezeClock = (at: Date | string) => {
  frozen = new Date(at).getTime();
};

export const resetClock = () => {
  frozen = null;
};
