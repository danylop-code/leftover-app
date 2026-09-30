import { render, screen } from '@testing-library/react-native';
import { color } from '../../theme';
import { Price } from './Price';

describe('Price', () => {
  it('strikes through the original price and shows the sale price', () => {
    render(<Price originalMinor={45000} priceMinor={14900} />);
    expect(screen.getByText('₴450')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(screen.getByText('₴149')).not.toHaveStyle({ textDecorationLine: 'line-through' });
  });

  it('reads both prices in one accessible label', () => {
    render(<Price originalMinor={45000} priceMinor={14900} />);
    expect(screen.getByLabelText('₴149, was ₴450')).toBeOnTheScreen();
  });

  it('renders only the sale price without an original', () => {
    render(<Price priceMinor={14900} />);
    expect(screen.getByText('₴149')).toBeOnTheScreen();
    expect(screen.queryByText('₴450')).toBeNull();
  });

  it('greys the sale price when sold out', () => {
    render(<Price originalMinor={45000} priceMinor={14900} soldOut />);
    expect(screen.getByText('₴149')).toHaveStyle({ color: color.textSecondary });
  });
});
