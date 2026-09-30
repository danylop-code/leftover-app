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
  transparent: 'transparent',
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

// Dark scheme (brief 19): same keys, warm near-black surfaces, and lighter brand tints so text
// and controls keep WCAG AA contrast (checked in contrast.test.ts). Proposed for the canvas as
// `:root[data-theme="dark"]` (fixtures/design-dark.ts).
export const darkColor = {
  primary: '#8FCBA6',
  primaryPressed: '#A9D8BB',
  primarySoft: '#21382B',
  onPrimary: '#0E1E15',
  accent: '#E8804B',
  accentPressed: '#F29A6A',
  accentSoft: '#3B2418',
  onAccent: '#1A0D06',
  background: '#121814',
  surface: '#1B221E',
  surfaceSunken: '#0D120F',
  textPrimary: '#EEE8DA',
  textSecondary: '#A7B0A6',
  textDisabled: '#6A7369',
  border: '#2D3630',
  borderStrong: '#7A857B',
  success: '#72C792',
  successSoft: '#1B3325',
  warning: '#E4B563',
  warningSoft: '#382C12',
  danger: '#F2917F',
  dangerSoft: '#3D1E1A',
  star: '#E9B23C',
  starEmpty: '#3A423B',
  scrim: 'rgba(0,0,0,.6)',
  inverse: '#EEE8DA',
  onInverse: '#121814',

  switchTrackOff: '#4A544D',
  primaryTint: '#17251D',
  primaryDeep: '#7DBB95',
  // The toast is light in the dark scheme, so its accents are the light scheme's inks.
  toastSuccessIcon: '#2F7A4E',
  toastErrorIcon: '#B3372B',
  toastAction: '#A3441A',
  mediaHighlight: 'rgba(255,255,255,.06)',
  mapPinShadow: 'rgba(0,0,0,.4)',
  transparent: 'transparent',
} as const satisfies Record<keyof typeof color, string>;

export const darkMedia = {
  bakery: '#4A3A22',
  bakeryInk: '#E6C48E',
  meal: '#4D2E22',
  mealInk: '#F0A988',
  grocery: '#2A3A26',
  groceryInk: '#A8CF95',
  cafe: '#3D3126',
  cafeInk: '#D9BC9B',
  produce: '#3A3D20',
  produceInk: '#D2D68E',
  other: darkColor.surfaceSunken,
  otherInk: darkColor.textSecondary,
} as const satisfies Record<keyof typeof media, string>;

// Map tiles stay light in both schemes (brief 19), so the map tokens do too.
export const darkMap = map;
