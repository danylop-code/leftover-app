// In-memory stand-in for expo-secure-store in Jest (registered in jest.setup.ts).
const items = new Map<string, string>();

export const secureStoreMock = {
  getItemAsync: jest.fn(async (key: string) => items.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    items.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    items.delete(key);
  }),
  /** Test helper: wipe everything between tests. */
  __reset: () => items.clear(),
};
