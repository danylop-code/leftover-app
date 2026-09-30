import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { usePreferences } from '../../../../shared/store/preferences';
import { CodeInput } from './CodeInput';

function Harness({ initial = '' }: { initial?: string }) {
  const [code, setCode] = useState(initial);
  return <CodeInput value={code} onChange={setCode} />;
}

const box = (n: number) => screen.getByLabelText(`Digit ${n}`);
const values = () => [1, 2, 3, 4].map((n) => box(n).props.value);

describe('CodeInput', () => {
  it('fills one box per digit', () => {
    render(<Harness />);
    fireEvent.changeText(box(1), '4');
    fireEvent.changeText(box(2), '8');
    expect(values()).toEqual(['4', '8', '', '']);
  });

  it('fills every box from a pasted code, ignoring anything but digits', () => {
    render(<Harness />);
    fireEvent.changeText(box(1), '48-27');
    expect(values()).toEqual(['4', '8', '2', '7']);
  });

  it('Backspace on an empty box clears the one before it', () => {
    render(<Harness initial="48" />);
    fireEvent(box(3), 'keyPress', { nativeEvent: { key: 'Backspace' } });
    expect(values()).toEqual(['4', '', '', '']);
  });

  it('clearing a box removes just that digit', () => {
    render(<Harness initial="4827" />);
    fireEvent.changeText(box(4), '');
    expect(values()).toEqual(['4', '8', '2', '']);
  });

  it('stays left-to-right in Arabic, so 1234 reads 1-2-3-4 (brief 22)', async () => {
    await act(async () => usePreferences.getState().setLanguage('ar'));
    render(<Harness />);
    const row = screen.getByLabelText('رمز الاستلام');
    expect(StyleSheet.flatten(row.props.style).direction).toBe('ltr');
    await act(async () => usePreferences.getState().setLanguage('en'));
  });
});
