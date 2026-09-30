// Runs before every test file's imports. The existing suites were written against the Lviv
// market (₴, kopiyky); OMR tests switch `EXPO_PUBLIC_MARKET` themselves.
process.env.EXPO_PUBLIC_MARKET = 'UA';
