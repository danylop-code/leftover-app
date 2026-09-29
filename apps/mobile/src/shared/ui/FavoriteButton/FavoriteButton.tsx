import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { Icon } from '../icons';
import { heart, styles } from './styles';

type Props = { name: string; saved: boolean; onToggle: () => void };

/** The heart "Save <shop>" button on bag cards and the shop header (`.fav`). */
export function FavoriteButton({ name, saved, onToggle }: Props) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        saved ? t('ui.favorite.unsave', { name }) : t('ui.favorite.save', { name })
      }
      accessibilityState={{ selected: saved }}
      onPress={onToggle}
      hitSlop={heart.hitSlop}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon
        name="heart"
        color={saved ? heart.saved : heart.idle}
        fill={saved ? heart.saved : 'none'}
      />
    </Pressable>
  );
}
