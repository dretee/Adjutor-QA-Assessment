// helpers/testData.js
// ─────────────────────────────────────────────────────────
// Centralized test data and fixtures for all test suites.
// This eliminates hardcoded values and makes it easy to
// update test data without touching individual test files.
// ─────────────────────────────────────────────────────────

// ── KARMA LOOKUP TEST DATA ────────────────────────────────
const KARMA_DATA = {
  // Valid identifiers from official Lendsqr docs
  blacklistedDomain: '0zspgifzbo.ga',
  validEmail: 'notblacklisted@example.com',
  validPhone: '+2347012345678',
  validBvn: '22212345678',
  validNuban: '058-1234567890',

  // Invalid/boundary identifiers for negative tests
  malformedPhone: '7012345678', // missing country code
  veryLongIdentifier: 'x'.repeat(500),
  xssPayload: '<script>alert("xss")</script>',
  sqlInjection: "'; DROP TABLE users; --",

  // API cost
  costPerHit: 10,
};

// ── ECOSYSTEM LOOKUP TEST DATA ────────────────────────────
const ECOSYSTEM_DATA = {
  // Valid BVN from official docs
  validBvn: '22153475955',

  // Invalid BVNs for negative tests
  shortBvn: '2215347', // < 11 digits
  longBvn: '221534759550000000', // > 11 digits
  alphaBvn: 'ABCDEFGHIJK',
  zerosBvn: '00000000000',

  // Required schema fields
  identityFields: [
    'bvn',
    'first_name',
    'last_name',
    'bvn_phone_number',
    'date_of_birth',
    'age',
    'gender',
    'email',
    'phone_number',
    'lenders',
    'credit_delinquency',
    'processed_on',
  ],

  // Financial/numeric fields that must be numbers
  numericFields: [
    'loans',
    'loan_amount',
    'loan_amount_minimum',
    'loan_amount_maximum',
    'settled_loans',
    'settled_loan_amount',
    'running_loans',
    'running_loan_amount',
    'past_due_loans',
    'past_due_loan_amount',
    'penalty',
    'logins',
    'credit_delinquency',
    'lenders',
    'failed_selfie_bvn_check',
    'loan_requests',
    'failed_loan_requests',
  ],

  // API cost
  costPerCall: 25,
};

// ── BVN VERIFICATION TEST DATA ────────────────────────────
const BVN_DATA = {
  // Valid BVN for testing (from official docs)
  validBvn: '22123456789',

  // BVN for selfie tests (from official docs example)
  selfieTestBvn: '22536011111',

  // Consent init contact options
  validEmailContact: 'testuser@capitalcash.ng',
  validPhoneContact: '+2348012345678',

  // Invalid contacts for negative tests
  malformedEmail: 'not-an-email',
  missingContactField: {},

  // Invalid BVNs
  shortBvn: '2212345678', // 10 digits instead of 11
  invalidBvn: '00000000000',

  // Costs per official docs
  initCost: 0, // Consent init is free
  completeCost: 20, // OTP verification
  selfieCost: 30, // Image match

  // Test OTP for completion (will likely fail on real API)
  testOtp: '123456',
  wrongOtp: '000000',
};

// ── BANK ACCOUNT VERIFICATION TEST DATA ──────────────────
const BANK_ACCOUNT_DATA = {
  // Valid account from official docs
  validAccount: {
    account_number: '0425571111',
    bank_code: '058',
  },

  // Valid bank codes (sample)
  validBankCodes: ['058', '007', '044', '033'],

  // Invalid accounts for negative tests
  missingAccountNumber: {
    bank_code: '058',
  },
  missingBankCode: {
    account_number: '0425571111',
  },
  emptyRequest: {},

  // Invalid account formats
  nonExistentAccount: {
    account_number: '9999999999',
    bank_code: '058',
  },
  invalidBankCode: {
    account_number: '0425571111',
    bank_code: 'INVALID',
  },
  alphaAccountNumber: {
    account_number: 'ABCDEFGHIJ',
    bank_code: '058',
  },

  // API cost
  costPerCall: 10,

  // Expected account name pattern (letters and spaces only)
  accountNamePattern: /^[A-Za-z\s]+$/,
};

// ── SHARED TEST CONSTANTS ─────────────────────────────────
const SHARED_DATA = {
  // Expected HTTP status codes
  HTTP_STATUS: {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    UNPROCESSABLE: 422,
  },

  // Error status codes that are acceptable for certain tests
  CLIENT_ERROR_CODES: [400, 401, 404, 422],
  EXPECTED_ERROR_CODES: [400, 404, 422],

  // Response structure fields
  REQUIRED_FIELDS: {
    status: 'string',
    message: 'string',
  },

  // Performance thresholds
  RESPONSE_TIME_THRESHOLD_MS: 1500,
  EXCELLENT_RESPONSE_TIME: 200,
  ACCEPTABLE_RESPONSE_TIME: 500,
  SLOW_RESPONSE_TIME: 1000,
};

module.exports = {
  KARMA_DATA,
  ECOSYSTEM_DATA,
  BVN_DATA,
  BANK_ACCOUNT_DATA,
  SHARED_DATA,
};
