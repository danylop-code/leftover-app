import { splitMatch } from './highlight';

describe('splitMatch', () => {
  it('marks the first case-insensitive match', () => {
    expect(splitMatch('vul. Doroshenka 14', 'dorosh')).toEqual([
      { text: 'vul. ', match: false, start: 0 },
      { text: 'Dorosh', match: true, start: 5 },
      { text: 'enka 14', match: false, start: 11 },
    ]);
  });

  it('handles a match at the start and ignores surrounding spaces in the query', () => {
    expect(splitMatch('Doroshenka tram stop', ' Dorosh ')).toEqual([
      { text: 'Dorosh', match: true, start: 0 },
      { text: 'enka tram stop', match: false, start: 6 },
    ]);
  });

  it('returns the whole text unmarked when nothing matches', () => {
    expect(splitMatch('Rynok Square 1', 'Svobody')).toEqual([
      { text: 'Rynok Square 1', match: false, start: 0 },
    ]);
    expect(splitMatch('Rynok Square 1', '')).toEqual([
      { text: 'Rynok Square 1', match: false, start: 0 },
    ]);
  });
});
