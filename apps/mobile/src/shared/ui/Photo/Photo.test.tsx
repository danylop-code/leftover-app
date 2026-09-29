import { fireEvent, render, screen } from '@testing-library/react-native';
import { CategoryMedia } from '../CategoryMedia/CategoryMedia';
import { StoreLogo } from '../StoreLogo/StoreLogo';

// Media and logos are decorative (hidden from screen readers), so queries include hidden ones.
const hidden = { includeHiddenElements: true };
const photo = () => screen.getByTestId('photo', hidden);
const noPhoto = () => screen.queryByTestId('photo', hidden);

describe('photos over placeholders (brief 20)', () => {
  it('loads an API image path from the API and keeps the placeholder underneath', () => {
    render(<CategoryMedia category="bakery" photo="/images/bags/b1/photo/a.jpg" />);
    expect(photo()).toHaveProp('source', [
      { uri: 'http://localhost:8787/images/bags/b1/photo/a.jpg' },
    ]);
  });

  it('shows only the placeholder without a photo', () => {
    render(<StoreLogo id="s1" name="Crumb" />);
    expect(noPhoto()).toBeNull();
    expect(screen.getByText('C', hidden)).toBeOnTheScreen();
  });

  it('falls back to the placeholder when the image fails to load (no broken image)', () => {
    render(<StoreLogo id="s1" name="Crumb" logo="/images/stores/s1/logo/a.png" />);
    fireEvent(photo(), 'error', { nativeEvent: { error: 'boom' } });
    expect(noPhoto()).toBeNull();
    expect(screen.getByText('C', hidden)).toBeOnTheScreen();
  });

  it('shows a picked local file as is', () => {
    render(<CategoryMedia category="meals" photo="file:///tmp/photo.jpg" />);
    expect(photo()).toHaveProp('source', [{ uri: 'file:///tmp/photo.jpg' }]);
  });
});
