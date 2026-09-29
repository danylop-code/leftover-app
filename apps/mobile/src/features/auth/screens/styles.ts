import { makeStyles, space } from '../../../shared/theme';

export const useStyles = makeStyles(({ color, typography, sheet }) => {
  // Shared by the auth screens (Welcome, Register, Login, placeholder).
  const styles = sheet({
    intro: { gap: space[2] },
    introTight: { gap: 6 },
    title: { ...typography.display, color: color.textPrimary },
    body: { ...typography.body, color: color.textSecondary },
    form: { gap: space[4] },
    roles: { flexDirection: 'row', gap: space[3] },
    content: { gap: space[6], paddingBottom: space[10] },
    welcomeBody: {
      flex: 1,
      gap: space[3],
      paddingTop: 28,
      paddingHorizontal: space[6],
      paddingBottom: space[8],
    },
    wordmark: { ...typography.title, color: color.primary, letterSpacing: -0.72 },
    actions: { marginTop: 'auto', gap: space[2] },
  });
  return { styles };
});
