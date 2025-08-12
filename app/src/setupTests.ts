import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Silence React act warnings in tests output for cleaner logs
const originalError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    const msg = args?.[0] ?? '';
    if (typeof msg === 'string' && msg.includes('Warning: An update to')) return;
    // @ts-ignore
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  // @ts-ignore
  console.error.mockRestore?.();
});

// JSDOM polyfills for UI libs
if (typeof window.matchMedia !== 'function') {
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = global.ResizeObserver || RO;

// IntersectionObserver mock
// @ts-ignore
global.IntersectionObserver = global.IntersectionObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
