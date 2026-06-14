/**
 * Post-framework setup: runs after Jest globals (expect, jest, etc.) are available.
 * Placed in jest/ (not __tests__/) so Jest doesn't treat it as a test suite.
 *
 * Sets up global mocks used by every test file.
 */

// Mock zustand with per-store state isolation
jest.mock('zustand', () => {
  const stores = new Map();
  const mockCreate = (initializer) => {
    const id = Symbol('zustand-store');
    let storeState = {};
    const setState = (partial) => {
      const newState = typeof partial === 'function' ? partial(storeState) : partial;
      storeState = { ...storeState, ...newState };
    };
    const getState = () => storeState;
    const subscribe = () => () => {};
    const api = { setState, getState, subscribe };
    storeState = initializer(setState, getState, api);
    stores.set(id, api);
    return api;
  };
  return { create: mockCreate, default: { create: mockCreate } };
});
