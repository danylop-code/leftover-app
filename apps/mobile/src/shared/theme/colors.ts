// Ported 1:1 from the design's theme.css :root (`--color-primary` → `color.primary`).
export const color = {
  primary: '#1F4D3A',
  primaryPressed: '#163A2B',
  primarySoft: '#DDE9DF',
  onPrimary: '#FFFFFF',
  accent: '#C4531F',
  accentPressed: '#A3441A',
  accentSoft: '#FBE4D5',
  onAccent: '#FFFFFF',
  background: '#FAF4E8',
  surface: '#FFFFFF',
  surfaceSunken: '#F2EADA',
  textPrimary: '#1D2A22',
  textSecondary: '#5B6A60',
  textDisabled: '#9FA79D',
  border: '#E6DCC8',
  borderStrong: '#978A70',
  success: '#2F7A4E',
  successSoft: '#DDF0E3',
  warning: '#8F5C0E',
  warningSoft: '#FBEDCB',
  danger: '#B3372B',
  dangerSoft: '#FAE0DB',
  star: '#E0A11B',
  starEmpty: '#E2D8C4',
  scrim: 'rgba(29,42,34,.5)',
  inverse: '#1D2A22',
  onInverse: '#FFFFFF',

  // Not in :root — literal values the design's component CSS uses, named here so
  // components never carry a color literal.
  switchTrackOff: '#CEC4B0',
  primaryTint: '#F3F8F4',
  primaryDeep: '#275A45',
  toastSuccessIcon: '#8ED3A7',
  toastErrorIcon: '#F4A597',
  toastAction: '#F7C9AE',
  mediaHighlight: 'rgba(255,255,255,.3)',
  mapPinShadow: 'rgba(29,42,34,.25)',
} as const;

// Category tints for food-photo placeholders (`--media-bakery`, `--media-bakery-ink`).
export const media = {
  bakery: '#F0D9AE',
  bakeryInk: '#8A5A1E',
  meal: '#F4CDB8',
  mealInk: '#9C3F1C',
  grocery: '#D5E5CB',
  groceryInk: '#2F5E3F',
  cafe: '#E6D6C3',
  cafeInk: '#6B4A2E',
  produce: '#E4E7BE',
  produceInk: '#5E6A1C',
  // The design has no tint for `other`; neutral sunken surface.
  other: color.surfaceSunken,
  otherInk: color.textSecondary,
} as const;

export const map = {
  land: '#E6EBD9',
  park: '#D0E0C1',
  water: '#C8DEE2',
  road: '#FFFFFF',
  roadMinor: '#F5F1E6',
  block: '#DDE3CE',
  radiusFill: 'rgba(31,77,58,.12)',
  radiusStroke: 'rgba(31,77,58,.5)',
} as const;

// Store logo backgrounds (`.logo-crumb` … `.logo-greenrow`); picked by a stable hash of the store id.
export const logoPalette = ['#8A5A2B', '#A6452A', '#2F6B4A', '#44506F', '#5F6D1C'] as const;
