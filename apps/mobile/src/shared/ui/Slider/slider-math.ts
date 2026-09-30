/** Snaps a raw value to the step grid inside [min, max]. */
export const snap = (raw: number, min: number, max: number, step: number) => {
  const stepped = Math.round((raw - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
};

/** Value under an x offset along a track of `width`. */
export const valueAt = (x: number, width: number, min: number, max: number, step: number) =>
  width <= 0 ? min : snap(min + (x / width) * (max - min), min, max, step);

/** Fraction 0–1 of the track covered at `value`. */
export const fraction = (value: number, min: number, max: number) =>
  max === min ? 0 : (value - min) / (max - min);
