// Proposed dark block for the design canvas theme.css (brief 19): paste it after :root once
// the canvas update is approved. Same keys as :root; map tokens stay light (light map tiles).
export const designDarkCss = `
:root[data-theme="dark"]{
  /* ---- color ---- */
  --color-primary:#8FCBA6;
  --color-primary-pressed:#A9D8BB;
  --color-primary-soft:#21382B;
  --color-on-primary:#0E1E15;
  --color-accent:#E8804B;
  --color-accent-pressed:#F29A6A;
  --color-accent-soft:#3B2418;
  --color-on-accent:#1A0D06;
  --color-background:#121814;
  --color-surface:#1B221E;
  --color-surface-sunken:#0D120F;
  --color-text-primary:#EEE8DA;
  --color-text-secondary:#A7B0A6;
  --color-text-disabled:#6A7369;
  --color-border:#2D3630;
  --color-border-strong:#7A857B;
  --color-success:#72C792;
  --color-success-soft:#1B3325;
  --color-warning:#E4B563;
  --color-warning-soft:#382C12;
  --color-danger:#F2917F;
  --color-danger-soft:#3D1E1A;
  --color-star:#E9B23C;
  --color-star-empty:#3A423B;
  --color-scrim:rgba(0,0,0,.6);
  --color-inverse:#EEE8DA;
  --color-on-inverse:#121814;
  --media-bakery:#4A3A22;
  --media-bakery-ink:#E6C48E;
  --media-meal:#4D2E22;
  --media-meal-ink:#F0A988;
  --media-grocery:#2A3A26;
  --media-grocery-ink:#A8CF95;
  --media-cafe:#3D3126;
  --media-cafe-ink:#D9BC9B;
  --media-produce:#3A3D20;
  --media-produce-ink:#D2D68E;
  --elevation-0:none;
  --elevation-1:0 1px 2px rgba(0,0,0,.3),0 2px 8px rgba(0,0,0,.3);
  --elevation-2:0 4px 10px rgba(0,0,0,.35),0 10px 24px rgba(0,0,0,.35);
  --elevation-3:0 12px 28px rgba(0,0,0,.45),0 24px 56px rgba(0,0,0,.4);
}
`;
