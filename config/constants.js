// config/constants.js
// ─────────────────────────────────────────────────────────
// Global constants and configuration values used throughout
// the test suite. This prevents magic numbers scattered
// throughout the codebase.
// ─────────────────────────────────────────────────────────

// ── HTTP CONFIGURATION ────────────────────────────────────
const HTTP_CONFIG = {
  // Request timeout in milliseconds
  REQUEST_TIMEOUT_MS: 15000,

  // Default headers for all requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Bearer token prefix
  BEARER_PREFIX: 'Bearer ',
};

// ── PERFORMANCE THRESHOLDS ────────────────────────────────
const PERFORMANCE = {
  // Individual response time threshold
  RESPONSE_TIME_THRESHOLD_MS: 1500,

  // Performance rating bands (milliseconds)
  EXCELLENT: 200,
  ACCEPTABLE: 500,
  SLOW: 1000,

  // Performance rating labels
  RATINGS: {
    EXCELLENT: '✅ Excellent  (<200ms)',
    ACCEPTABLE: '⚠️  Acceptable (200–500ms)',
    SLOW: '🔶 Slow       (500ms–1s)',
    POOR: '🔴 Poor       (>1s)',
  },
};

// ── HTTP STATUS CODES ─────────────────────────────────────
const HTTP_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// ── API COST PRICING (in NGN) ─────────────────────────────
const API_COSTS = {
  KARMA_LOOKUP: 10,
  ECOSYSTEM_LOOKUP: 25,
  BVN_CONSENT_INIT: 0,
  BVN_CONSENT_COMPLETE: 20,
  BVN_SELFIE_MATCH: 30,
  BANK_ACCOUNT_VERIFY: 10,
};

// ── VALIDATION PATTERNS ───────────────────────────────────
const VALIDATION_PATTERNS = {
  // Nigerian phone number: +2347012345678 or 07012345678
  PHONE_NUMBER: /^(\+234|0)7[0-9]{1}[0-9]{8}$/,

  // Email validation (basic)
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // BVN: exactly 11 digits
  BVN: /^[0-9]{11}$/,

  // Bank code: 3 digits
  BANK_CODE: /^[0-9]{3}$/,

  // Account number: typically 10 digits
  ACCOUNT_NUMBER: /^[0-9]{10}$/,

  // Account name: letters and spaces only
  ACCOUNT_NAME: /^[A-Za-z\s]+$/,

  // Domain name (basic)
  DOMAIN: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
};

// ── TEST CONFIGURATION ────────────────────────────────────
const TEST_CONFIG = {
  // Run tests sequentially to avoid rate limiting
  RUN_IN_BAND: true,

  // Timeout for individual tests (in ms)
  TEST_TIMEOUT_MS: 30000,

  // Enable verbose output
  VERBOSE: false,

  // Report directory
  REPORT_DIR: './reports',

  // JSON output file for CI/CD
  CI_OUTPUT_FILE: './reports/jest-results.json',
};

// ── LOGGING LEVELS ───────────────────────────────────────
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

// ── ERROR MESSAGES ────────────────────────────────────────
const ERROR_MESSAGES = {
  MISSING_API_KEY: 'ADJUTOR_API_KEY is not configured',
  MISSING_BASE_URL: 'BASE_URL is not configured',
  REQUEST_TIMEOUT: 'API request timed out',
  UNEXPECTED_STATUS: 'Unexpected HTTP status code',
  SCHEMA_VALIDATION: 'Response schema validation failed',
  PERFORMANCE_THRESHOLD: 'Response time exceeded threshold',
};

// ── SUCCESS MESSAGES ──────────────────────────────────────
const SUCCESS_MESSAGES = {
  TEST_STARTED: 'Test suite started',
  TEST_COMPLETED: 'Test suite completed',
  ALL_TESTS_PASSED: 'All tests passed',
  SCHEMA_VALID: 'Schema validation successful',
};

module.exports = {
  HTTP_CONFIG,
  PERFORMANCE,
  HTTP_STATUS,
  API_COSTS,
  VALIDATION_PATTERNS,
  TEST_CONFIG,
  LOG_LEVELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
