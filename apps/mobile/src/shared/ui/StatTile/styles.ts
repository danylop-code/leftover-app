import { makeStyles, space } from '../../theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  const styles = sheet({
    tile: { flex: 1, paddingVertical: space[3], paddingHorizontal: 14, borderRadius: 14 },
    value: { ...typography.title },
    label: { ...typography.caption },
  });

  const tones = {
    primary: { bg: color.primarySoft, fg: color.primary },
    accent: { bg: color.accentSoft, fg: color.accentPressed },
  } as const;
  return { styles, tones };
});
