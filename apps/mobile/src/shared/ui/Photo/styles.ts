import { makeStyles } from '../../theme';

/** Cross-fade when a photo arrives over its placeholder, ms. */
export const FADE_MS = 150;

export const useStyles = makeStyles(({ sheet }) => {
  const styles = sheet({
    fill: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 },
  });
  return { styles };
});
