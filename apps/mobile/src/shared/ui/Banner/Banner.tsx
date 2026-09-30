import { Text, View } from 'react-native';
import { Icon, type IconName } from '../icons';
import { useStyles } from './styles';

type Props = {
  title: string;
  text?: string;
  icon?: IconName;
  tone?: keyof ReturnType<typeof useStyles>['tones'];
};

export function Banner({ title, text, icon = 'alert', tone = 'info' }: Props) {
  const { styles, tones } = useStyles();
  const t = tones[tone];
  return (
    <View
      style={[styles.root, { backgroundColor: t.bg }]}
      accessible
      accessibilityLiveRegion={tone === 'info' ? undefined : 'polite'}
      accessibilityRole={tone === 'info' ? 'summary' : 'alert'}
    >
      <View style={styles.icon}>
        <Icon name={icon} color={t.icon} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {text ? <Text style={styles.text}>{text}</Text> : null}
      </View>
    </View>
  );
}
