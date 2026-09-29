import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sheetPadding, useStyles } from './styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  text?: string;
  /** Buttons, stacked full width (primary first). */
  children?: ReactNode;
};

/** In-app bottom sheet (`.sheet` on a scrim) for confirmations and small forms. */
export function Sheet({ visible, onClose, title, text, children }: Props) {
  const { styles } = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View style={[styles.sheet, sheetPadding(insets.bottom)]} accessibilityViewIsModal>
          <View style={styles.grab} />
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {text ? <Text style={styles.text}>{text}</Text> : null}
          <View style={styles.actions}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}
