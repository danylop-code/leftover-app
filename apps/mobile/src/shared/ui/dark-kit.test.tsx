import { act, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { usePreferences } from '../store/preferences';
import { darkColor } from '../theme';
import { color } from '../theme/colors';
import { Badge } from './Badge/Badge';
import { Button } from './Button/Button';
import { Text } from './Text/Text';

const styleOf = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style);

describe('kit in both schemes (brief 19)', () => {
  it('renders text, buttons and badges from the active palette', async () => {
    render(
      <>
        <Text>Hello</Text>
        <Button label="Reserve" onPress={() => {}} />
        <Badge tone="ready" label="Ready now" />
      </>,
    );
    expect(styleOf('Hello').color).toBe(color.textPrimary);
    expect(styleOf('Ready now').color).toBe(color.success);

    await act(async () => usePreferences.getState().setAppearance('dark'));
    expect(styleOf('Hello').color).toBe(darkColor.textPrimary);
    expect(styleOf('Reserve').color).toBe(darkColor.onAccent);
    expect(styleOf('Ready now').color).toBe(darkColor.success);
  });
});
