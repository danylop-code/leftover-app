import { makeStyles } from '../../theme';

// Web only: a column about as wide as a large phone.
const PHONE_WIDTH = 430;

export const useStyles = makeStyles(({ color, direction, elevation, sheet }) => {
  const styles = sheet({
    // Right-to-left layout for Arabic (brief 21): Yoga mirrors rows and start/end below here.
    root: { flex: 1, direction },
    page: { flex: 1, alignItems: 'center', backgroundColor: color.surfaceSunken, direction },
    phone: {
      flex: 1,
      width: '100%',
      maxWidth: PHONE_WIDTH,
      overflow: 'hidden',
      backgroundColor: color.background,
      ...elevation[2],
    },
  });
  return { styles };
});
