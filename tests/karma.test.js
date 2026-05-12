// tests/karma.test.js
// ═══════════════════════════════════════════════════════════════
// MODULE  : Nigerian Country Specific Endpoints → Karma Lookup
// ENDPOINT: GET https://adjutor.lendsqr.com/v2/verification/karma/:identifier
// DOCS    : https://docs.adjutor.io/adjutor-api-endpoints/validation/karma-lookup
// COST    : ₦10 per successful hit
//
// VALID IDENTIFIER TYPES (per official docs):
//   Email         →  email@example.com
//   Phone         →  +2347012345678
//   Domain        →  example.com
//   BVN           →  22212345678
//   NUBAN Account →  XXX-1234567890 (bank_code-account_number)
//   Image         →  Base64 encoded string
//
// REAL DOCUMENTED RESPONSE SCHEMA:
// {
//   "status": "success",
//   "message": "Successful",
//   "data": {
//     "karma_identity"     : "0zspgifzbo.ga",
//     "amount_in_contention": "0.00",
//     "reason"             : null,
//     "default_date"       : "2020-05-18",
//     "karma_type"         : { "karma": "Others" },
//     "karma_identity_type": { "identity_type": "Domain" },
//     "reporting_entity"   : { "name": "Blinkcash", "email": "support@blinkcash.ng" }
//   },
//   "meta": { "cost": 10, "balance": 1600 }
// }
//
// TEST PLAN (10 cases):
//   Positive  → TC-KL-001 Valid blacklisted domain → 200 + full schema
//             → TC-KL-002 Valid email identifier    → 200 or clean 404
//             → TC-KL-003 Valid +234 phone number   → 200 or clean 404
//             → TC-KL-004 Valid 11-digit BVN        → 200 or clean 404
//             → TC-KL-005 NUBAN account format      → 200 or clean 404
//   Negative  → TC-KL-006 No Authorization header  → 401
//             → TC-KL-007 Invalid Bearer token      → 401
//             → TC-KL-008 Malformed phone number    → 4xx (not 5xx)
//             → TC-KL-009 500-char identifier       → 4xx (not 5xx)
//             → TC-KL-010 XSS payload in identifier → 4xx (not 5xx)
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const { apiClient, unauthClient, printPerfSummary } = require('../config/apiClient');
const { KARMA_DATA, SHARED_DATA } = require('../helpers/testData');
const {
  expectSuccessResponse,
  expectErrorResponse,
  expectPerformanceThreshold,
  recordTiming,
  recordErrorTiming,
} = require('../helpers/responseValidators');

const responseTimes = [];

afterAll(() => printPerfSummary('KARMA LOOKUP', responseTimes));

// ── helper: record timing from successful response ─────────
const t = (res) => recordTiming(res, responseTimes);
const tErr = (err) => recordErrorTiming(err, responseTimes);

// ────────────────────────────────────────────────────────────
describe('Karma Lookup — GET /verification/karma/:identifier', () => {

  // ── POSITIVE CASES ────────────────────────────────────────

  test('TC-KL-001 | Blacklisted domain returns 200 with full documented schema', async () => {
    // Official test domain from Lendsqr documentation
    const identifier = KARMA_DATA.blacklistedDomain;
    const res = await apiClient.get(`/verification/karma/${identifier}`);
    t(res);

    // Use response validator
    expectSuccessResponse(res, KARMA_DATA.costPerHit);

    // Top-level data object
    const { data } = res.data;
    expect(data).toHaveProperty('karma_identity', identifier);
    expect(data).toHaveProperty('amount_in_contention');
    expect(data).toHaveProperty('default_date');

    // Nested objects
    expect(data.karma_type).toHaveProperty('karma');
    expect(data.karma_identity_type).toHaveProperty('identity_type');
    expect(data.reporting_entity).toHaveProperty('name');
    expect(data.reporting_entity).toHaveProperty('email');

    // Performance check
    expectPerformanceThreshold(
      res.config.metadata.responseTime,
      1500,
      'GET /verification/karma/:identifier'
    );
  });

  test('TC-KL-002 | Valid email identifier returns 200 or clean 404 (not on karma list)', async () => {
    try {
      const res = await apiClient.get(
        `/verification/karma/${encodeURIComponent(KARMA_DATA.validEmail)}`
      );
      t(res);
      expectSuccessResponse(res, KARMA_DATA.costPerHit);
      expect(res.data.data.karma_identity_type.identity_type).toBe('Email');
    } catch (err) {
      tErr(err);
      // 404 = clean record; that is the correct behaviour per docs
      expectErrorResponse(err, [200, 404]);
    }
  });

  test('TC-KL-003 | Valid Nigerian phone (+2347012345678 format) returns 200 or 404', async () => {
    try {
      const res = await apiClient.get(
        `/verification/karma/${encodeURIComponent(KARMA_DATA.validPhone)}`
      );
      t(res);
      expectSuccessResponse(res, KARMA_DATA.costPerHit);
      expect(res.data.data.karma_identity_type.identity_type).toBe('Phone Number');
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [200, 404]);
    }
  });

  test('TC-KL-004 | Valid 11-digit BVN returns 200 or 404', async () => {
    try {
      const res = await apiClient.get(`/verification/karma/${KARMA_DATA.validBvn}`);
      t(res);
      expectSuccessResponse(res, KARMA_DATA.costPerHit);
      expect(res.data.data.karma_identity_type.identity_type).toBe('BVN');
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [200, 404]);
    }
  });

  test('TC-KL-005 | Valid NUBAN account format (XXX-1234567890) returns 200 or 404', async () => {
    try {
      const res = await apiClient.get(`/verification/karma/${KARMA_DATA.validNuban}`);
      t(res);
      expect([200, 404]).toContain(res.status);
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [200, 404]);
    }
  });

  // ── NEGATIVE CASES ────────────────────────────────────────

  test('TC-KL-006 | Missing Authorization header returns 401 Unauthorized', async () => {
    expect.assertions(2);
    try {
      await unauthClient.get(`/verification/karma/${KARMA_DATA.blacklistedDomain}`);
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, 401, true);
    }
  });

  test('TC-KL-007 | Invalid Bearer token returns 401 Unauthorized', async () => {
    expect.assertions(2);
    try {
      await unauthClient.get(`/verification/karma/${KARMA_DATA.blacklistedDomain}`, {
        headers: { Authorization: 'Bearer INVALID_TOKEN_XYZ_999' },
      });
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, 401, true);
    }
  });

  test('TC-KL-008 | Malformed phone (missing country code) returns 4xx — not 5xx', async () => {
    // Phone without + or country code is invalid per the documented format
    expect.assertions(1);
    try {
      await apiClient.get(`/verification/karma/${KARMA_DATA.malformedPhone}`);
    } catch (err) {
      tErr(err);
      // Any 4xx is acceptable; a 5xx crash is a FAIL
      expect(err.response?.status).toBeLessThan(500);
    }
  });

  test('TC-KL-009 | Extremely long identifier (500 chars) returns 4xx — not 5xx', async () => {
    expect.assertions(1);
    try {
      await apiClient.get(`/verification/karma/${KARMA_DATA.veryLongIdentifier}`);
    } catch (err) {
      tErr(err);
      expect(err.response?.status).toBeLessThan(500);
    }
  });

  test('TC-KL-010 | XSS payload in identifier is rejected gracefully — not 5xx', async () => {
    // Security: injecting script tag; server must sanitise not crash
    expect.assertions(1);
    try {
      await apiClient.get(
        `/verification/karma/${encodeURIComponent(KARMA_DATA.xssPayload)}`
      );
    } catch (err) {
      tErr(err);
      expect(err.response?.status).toBeLessThan(500);
    }
  });

});
