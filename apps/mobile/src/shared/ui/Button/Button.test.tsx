import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('calls onPress when enabled', () => {
    const onPress = jest.fn();
    render(<Button label="Reserve" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Reserve' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled and ignores presses when disabled', () => {
    const onPress = jest.fn();
    render(<Button label="Sold out" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Sold out' });
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is busy, shows a spinner and ignores presses while loading', () => {
    const onPress = jest.fn();
    render(<Button label="Reserve" onPress={onPress} loading />);
    const button = screen.getByRole('button', { name: 'Reserve' });
    expect(button).toBeBusy();
    expect(screen.getByTestId('button-spinner')).toBeOnTheScreen();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
