// Verbatim copy of the design canvas theme.css :root block (Leftover App Design). Update together with the theme.
export const designRootCss = `
:root{
  /* ---- color ---- */
  --color-primary:#1F4D3A;
  --color-primary-pressed:#163A2B;
  --color-primary-soft:#DDE9DF;
  --color-on-primary:#FFFFFF;
  --color-accent:#C4531F;
  --color-accent-pressed:#A3441A;
  --color-accent-soft:#FBE4D5;
  --color-on-accent:#FFFFFF;
  --color-background:#FAF4E8;
  --color-surface:#FFFFFF;
  --color-surface-sunken:#F2EADA;
  --color-text-primary:#1D2A22;
  --color-text-secondary:#5B6A60;
  --color-text-disabled:#9FA79D;
  --color-border:#E6DCC8;
  --color-border-strong:#978A70;
  --color-success:#2F7A4E;
  --color-success-soft:#DDF0E3;
  --color-warning:#8F5C0E;
  --color-warning-soft:#FBEDCB;
  --color-danger:#B3372B;
  --color-danger-soft:#FAE0DB;
  --color-star:#E0A11B;
  --color-star-empty:#E2D8C4;
  --color-scrim:rgba(29,42,34,.5);
  --color-inverse:#1D2A22;
  --color-on-inverse:#FFFFFF;

  /* ---- media placeholders (category tints) ---- */
  --media-bakery:#F0D9AE;   --media-bakery-ink:#8A5A1E;
  --media-meal:#F4CDB8;     --media-meal-ink:#9C3F1C;
  --media-grocery:#D5E5CB;  --media-grocery-ink:#2F5E3F;
  --media-cafe:#E6D6C3;     --media-cafe-ink:#6B4A2E;
  --media-produce:#E4E7BE;  --media-produce-ink:#5E6A1C;

  /* ---- map ---- */
  --map-land:#E6EBD9; --map-park:#D0E0C1; --map-water:#C8DEE2;
  --map-road:#FFFFFF; --map-road-minor:#F5F1E6; --map-block:#DDE3CE;
  --map-radius-fill:rgba(31,77,58,.12); --map-radius-stroke:rgba(31,77,58,.5);

  /* ---- type ---- */
  --font-display:'Fraunces',Georgia,serif;
  --font-body:'Figtree',system-ui,-apple-system,sans-serif;
  --font-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --text-display:600 32px/38px var(--font-display);
  --text-title:600 24px/30px var(--font-display);
  --text-heading:700 18px/24px var(--font-body);
  --text-body:400 16px/24px var(--font-body);
  --text-label:600 14px/20px var(--font-body);
  --text-caption:500 12px/16px var(--font-body);

  /* ---- spacing (4-based) ---- */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px;
  --space-6:24px; --space-8:32px; --space-10:40px; --space-12:48px; --space-16:64px;

  /* ---- radii ---- */
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:20px; --radius-sheet:28px; --radius-pill:999px;

  /* ---- elevation ---- */
  --elevation-0:none;
  --elevation-1:0 1px 2px rgba(29,42,34,.06),0 2px 8px rgba(29,42,34,.06);
  --elevation-2:0 4px 10px rgba(29,42,34,.08),0 10px 24px rgba(29,42,34,.08);
  --elevation-3:0 12px 28px rgba(29,42,34,.14),0 24px 56px rgba(29,42,34,.12);

  --tap-min:48px;
}
`;
