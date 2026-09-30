import { act, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { usePreferences } from '../store/preferences';
import { arabicFontFamily, fontFamily } from '../theme/typography';
import { ListRow } from './ListRow/ListRow';
import { Price } from './Price/Price';
import { StatTile } from './StatTile/StatTile';
import { StoreLogo } from './StoreLogo/StoreLogo';
import { Ticket } from './Ticket/Ticket';

// Brief 22: long OMR prices and Arabic faces must fit their cards on iOS/Android, not only on web.
const styleOf = (text: string) =>
  StyleSheet.flatten(screen.getByText(text, { includeHiddenElements: true }).props.style);

afterEach(async () => {
  await act(async () => usePreferences.getState().setLanguage('en'));
});

describe('fitting on native (brief 22)', () => {
  it('lets Price give way: the row shrinks and wraps, the sale price stays on one line', () => {
    render(<Price originalMinor={45000} priceMinor={14900} />);
    const root = StyleSheet.flatten(screen.getByLabelText('₴149, was ₴450').props.style);
    expect(root).toMatchObject({ flexWrap: 'wrap', flexShrink: 1 });
    const sale = screen.getByText('₴149');
    expect(sale.props.numberOfLines).toBe(1);
    expect(sale.props.adjustsFontSizeToFit).toBe(true);
  });

  it('keeps a StatTile value on one line, scaled to fit', () => {
    render(<StatTile value="OMR 12.500" label="saved so far" />);
    const value = screen.getByText('OMR 12.500');
    expect(value.props.numberOfLines).toBe(1);
    expect(value.props.adjustsFontSizeToFit).toBe(true);
  });

  it("gives a ListRow's long value one line and never shrinks the label", () => {
    render(
      <ListRow
        icon="pin"
        label="Pickup area"
        value="Sultan Qaboos Highway, Al Khuwair, Muscat · 5 km"
        onPress={() => {}}
      />,
    );
    expect(screen.getByText(/Sultan Qaboos/).props.numberOfLines).toBe(1);
    expect(styleOf('Pickup area').flexShrink).toBe(0);
    expect(styleOf('Pickup area').flex).toBeUndefined();
  });

  it("draws a shop's initial in its own script's face, also in the Arabic UI", async () => {
    await act(async () => usePreferences.getState().setLanguage('ar'));
    render(
      <>
        <StoreLogo id="a" name="Qurum Crust Bakery" />
        <StoreLogo id="b" name="مخبز القرم" />
      </>,
    );
    expect(styleOf('Q').fontFamily).toBe(fontFamily.display['600italic']);
    expect(styleOf('م').fontFamily).toBe(arabicFontFamily.display['600']);
    expect(styleOf('Q').textAlign).toBe('center');
  });

  it('sets the pickup code in the Latin display face in Arabic, spaced as in English', async () => {
    await act(async () => usePreferences.getState().setLanguage('ar'));
    render(<Ticket code="9510" bandLabel="رمز" />);
    expect(styleOf('9510').fontFamily).toBe(fontFamily.display['600']);
    expect(styleOf('9510').letterSpacing).toBeGreaterThan(0);
  });
});
