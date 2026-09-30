import { fireEvent, render, screen } from '@testing-library/react-native';
import { Stars } from './Stars';

describe('Stars', () => {
  it('reports 1–5 from the pressed star in input mode', () => {
    const onChange = jest.fn();
    render(<Stars mode="input" value={0} onChange={onChange} />);
    fireEvent.press(screen.getByRole('button', { name: '1 star' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.press(screen.getByRole('button', { name: '5 stars' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('gives every star an accessible label and marks the selected ones', () => {
    render(<Stars mode="input" value={3} onChange={jest.fn()} />);
    const labels = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];
    for (const name of labels) expect(screen.getByRole('button', { name })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '3 stars' })).toBeSelected();
    expect(screen.getByRole('button', { name: '4 stars' })).not.toBeSelected();
  });

  it('reads as one image with the score in display mode', () => {
    render(<Stars value={4.7} />);
    expect(screen.getByRole('image', { name: '4.7 out of 5' })).toBeOnTheScreen();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
