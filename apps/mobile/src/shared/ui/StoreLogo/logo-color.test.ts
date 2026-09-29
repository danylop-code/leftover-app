import { logoPalette } from '../../theme';
import { logoColor } from './logo-color';

describe('logoColor', () => {
  it('is stable per seed and always from the palette', () => {
    expect(logoColor('store-1')).toBe(logoColor('store-1'));
    for (const id of ['a', 'b', 'store-42', '']) expect(logoPalette).toContain(logoColor(id));
  });
});
