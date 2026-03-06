// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill Web Crypto API for Jest (jsdom does not expose it by default)
const nodeCrypto = require('crypto');
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: nodeCrypto.webcrypto,
    writable: true,
    configurable: true,
  });
}
if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = require('util').TextDecoder;
}
