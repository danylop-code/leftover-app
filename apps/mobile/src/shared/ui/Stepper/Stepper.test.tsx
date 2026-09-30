import { fireEvent, render, screen } from '@testing-library/react-native';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('increments and decrements within bounds', () => {
    const onChange = jest.fn();
    render(<Stepper value={2} min={1} max={3} onChange={onChange} />);
    fireEvent.press(screen.getByRole('button', { name: 'More' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.press(screen.getByRole('button', { name: 'Fewer' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('disables + at max and does not change the value', () => {
    const onChange = jest.fn();
    render(<Stepper value={3} min={1} max={3} onChange={onChange} />);
    const more = screen.getByRole('button', { name: 'More' });
    expect(more).toBeDisabled();
    fireEvent.press(more);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Fewer' })).toBeEnabled();
  });

  it('disables − at min and does not change the value', () => {
    const onChange = jest.fn();
    render(<Stepper value={1} min={1} max={3} onChange={onChange} />);
    const fewer = screen.getByRole('button', { name: 'Fewer' });
    expect(fewer).toBeDisabled();
    fireEvent.press(fewer);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the value and accepts custom labels', () => {
    render(
      <Stepper
        value={2}
        min={1}
        max={5}
        onChange={jest.fn()}
        decreaseLabel="Fewer bags"
        increaseLabel="More bags"
      />,
    );
    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'More bags' })).toBeOnTheScreen();
  });
});
