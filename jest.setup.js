const { expect } = require('@jest/globals');
const matchers = require('@testing-library/jest-dom/matchers');

require('@testing-library/jest-dom');

// Extend Jest matchers
expect.extend(matchers);
