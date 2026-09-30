import { makeStyles } from '../../theme';

export const useStyles = makeStyles(({ color }) => {
  // DiscoverEmpty's inline SVG: 96 px, 4 px strokes in primary, white bag, accent leaf.
  const art = {
    size: 96,
    viewBox: '0 0 96 96',
    stroke: 4,
    colors: { ink: color.primary, bag: color.surface, leaf: color.accent },
    handle: 'M34 34v-6a14 14 0 0 1 28 0v6',
    bag: { x: 18, y: 32, width: 60, height: 50, rx: 16 },
    eyes: [
      { cx: 39, cy: 52 },
      { cx: 57, cy: 52 },
    ],
    eyeRadius: 3.5,
    smile: 'M40 67c4-4.5 12-4.5 16 0',
    leaf: 'M64 22c1.6-8.4 7.6-12.4 16-12.6-.8 8.4-6.8 13-16 12.6z',
  } as const;

  // DiscoverError: the wifi-off glyph at 64 px with a 1.6 stroke, in danger.
  const offline = { size: 64, stroke: 1.6, color: color.danger } as const;

  // PickupCollected: a 56 px check with a 2.4 stroke, in success.
  const success = { size: 56, stroke: 2.4, color: color.success } as const;
  return { art, offline, success };
});
