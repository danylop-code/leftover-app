import type { Me, MeStats } from '@leftover/shared';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SINGLE_LINE } from '../../../../shared/constants/ui';
import { formatMoney } from '../../../../shared/lib/format';
import { IconButton, StatTile } from '../../../../shared/ui';
import { useStyles } from './styles';

type Props = { user: Me; stats?: MeStats; onEdit: () => void };

const initials = (name: string) => name.trim().charAt(0).toUpperCase();

/** Who's signed in, and (for customers) their impact so far. */
export function ProfileCard({ user, stats, onEdit }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View
          style={styles.avatar}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.initials}>{initials(user.firstName)}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={SINGLE_LINE}>
            {user.firstName}
          </Text>
          <Text style={styles.email} numberOfLines={SINGLE_LINE}>
            {user.email}
          </Text>
        </View>
        <IconButton
          icon="edit"
          variant="tonal"
          size="sm"
          label={t('profile.edit')}
          onPress={onEdit}
        />
      </View>
      {stats ? (
        <View style={styles.stats}>
          <StatTile
            value={String(stats.bagsRescued)}
            label={t('profile.bagsRescued', { count: stats.bagsRescued })}
          />
          <StatTile
            tone="accent"
            value={formatMoney(stats.savedMinor)}
            label={t('profile.saved')}
          />
        </View>
      ) : null}
    </View>
  );
}
