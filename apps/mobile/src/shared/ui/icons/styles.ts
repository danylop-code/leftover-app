import { makeStyles } from '../../theme';

export const useStyles = makeStyles(({ sheet }) => {
  const styles = sheet({
    // Right-to-left, arrows point the other way (brief 21).
    mirrored: { transform: [{ scaleX: -1 }] },
  });
  return { styles };
});
