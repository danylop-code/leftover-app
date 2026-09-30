import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';

type Props = {
  children: ReactNode;
  /** Pinned above scrolling content (headers, chip rows). */
  header?: ReactNode;
  /** Pinned below content (bottom bars). */
  footer?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
};

const defaultEdges: Edge[] = ['top'];

/** Screen frame: background, safe area, optional scroll and screen-margin padding. */
export function Screen({
  children,
  header,
  footer,
  scroll,
  padded = true,
  edges = defaultEdges,
}: Props) {
  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, padded && styles.padded]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, padded && styles.padded]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}
