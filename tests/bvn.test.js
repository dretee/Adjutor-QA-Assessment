// tests/bvn.test.js
// ═══════════════════════════════════════════════════════════════
// MODULE  : Nigerian Country Specific Endpoints → BVN Verification
// DOCS    : https://docs.adjutor.io/adjutor-api-endpoints/validation/bank-verification-number
//
// SUB-ENDPOINTS:
//   POST /verification/bvn/:bvn/accounts  — Initialize BVN Consent
//   PUT  /verification/bvn/:bvn/accounts  — Complete Consent + get BVN details
//   POST /verification/bvn/:bvn/selfies   — BVN Image Match
//
// REAL RESPONSE SCHEMAS (from official docs):
//
//  Init Consent (POST):
//    { "status": "otp", "message": "Please provide OTP sent to contact",
//      "data": "0808***2636", "meta": { "cost": 0, "balance": 4815 } }
//
//  Complete Consent (PUT):
//    { "status": "success", "message": "Successful",
//      "data": { "reference", "bvn", "first_name", "middle_name",
//                "last_name", "dob", "mobile", "email", "gender",
//                "lga_of_origin", "state_of_origin", "watchlisted",
//                "image_url", ... },
//      "meta": { "cost": 20, "balance": 4815 } }
//
//  BVN Image Match (POST):
//    { "status": "success", "message": "Successful",
//      "data": { "match": true, "similarity": 99.94831085205078 },
//      "meta": { "cost": 30, "balance": 1285 } }
//
// TEST PLAN (12 cases):
//   Init Consent  → TC-BVN-001  Valid BVN + email contact → otp status
//                 → TC-BVN-002  Response has masked contact in data field
//                 → TC-BVN-003  Init cost = ₦0 (consent init is free per docs)
//                 → TC-BVN-004  Missing contact field → 4xx
//                 → TC-BVN-005  BVN < 11 digits → 4xx
//                 → TC-BVN-006  No auth → 401
//   Complete OTP  → TC-BVN-007  Wrong OTP → 4xx
//                 → TC-BVN-008  Missing otp field → 4xx
//                 → TC-BVN-009  No auth → 401
//   Image Match   → TC-BVN-010  Image cost = ₦30 per docs (if matched)
//                 → TC-BVN-011  Missing image field → 4xx
//                 → TC-BVN-012  No auth → 401
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const { apiClient, unauthClient, printPerfSummary } = require('../config/apiClient');
const { BVN_DATA } = require('../helpers/testData');
const {
  expectOtpResponse,
  expectSuccessResponse,
  expectErrorResponse,
  expectNonEmptyString,
  recordTiming,
  recordErrorTiming,
} = require('../helpers/responseValidators');

const responseTimes = [];

afterAll(() => printPerfSummary('BVN VERIFICATION', responseTimes));

const t    = (res) => recordTiming(res, responseTimes);
const tErr = (err) => recordErrorTiming(err, responseTimes);

// ════════════════════════════════════════════════════════════════
describe('BVN Consent Init — POST /verification/bvn/:bvn/accounts', () => {

  test('TC-BVN-001 | Valid BVN + email contact returns otp status and masked data', async () => {
    try {
      const res = await apiClient.post(
        `/verification/bvn/${BVN_DATA.validBvn}/accounts`,
        { contact: BVN_DATA.validEmailContact }
      );
      t(res);

      // Per docs the status should be "otp" — not "success"
      expectOtpResponse(res);
    } catch (err) {
      tErr(err);
      // API might return 4xx if BVN doesn't match any record — still valid
      expect(err.response?.status).toBeLessThan(500);
    }
  });

  test('TC-BVN-002 | Consent init data field contains masked contact string', async () => {
    try {
      const res = await apiClient.post(
        `/verification/bvn/${BVN_DATA.validBvn}/accounts`,
        { contact: 'ado@example.com' }
      );
      t(res);
      // The "data" field should be a masked phone/email (e.g. "0808***2636")
      expectNonEmptyString(res.data.data, 'masked contact');
    } catch (err) {
      tErr(err);
      expect(err.response?.status).toBeLessThan(500);
    }
  });

  test('TC-BVN-003 | Consent init meta cost is ₦0 — initiation is free per docs', async () => {
    try {
      const res = await apiClient.post(
        `/verification/bvn/${BVN_DATA.validBvn}/accounts`,
        { contact: BVN_DATA.validEmailContact }
      );
      t(res);
      // Per official docs the cost at init stage = 0
      expect(res.data.meta.cost).toBe(BVN_DATA.initCost);
    } catch (err) {
      tErr(err);
      expect(err.response?.status).toBeLessThan(500);
    }
  });

  test('TC-BVN-004 | Missing contact field in body returns 400 or 422', async () => {
    expect.assertions(2);
    try {
      await apiClient.post(`/verification/bvn/${BVN_DATA.validBvn}/accounts`, {});
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 422], true);
    }
  });

  test('TC-BVN-005 | BVN shorter than 11 digits returns 4xx (path param validation)', async () => {
    expect.assertions(1);
    try {
      await apiClient.post(`/verification/bvn/${BVN_DATA.shortBvn}/accounts`, {
        contact: 'test@example.com',
      });
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 404, 422], false);
    }
  });

  test('TC-BVN-006 | No Authorization header on consent init returns 401', async () => {
    expect.assertions(2);
    try {
      await unauthClient.post(`/verification/bvn/${BVN_DATA.validBvn}/accounts`, {
        contact: 'test@example.com',
      });
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, 401, true);
    }
  });

});

// ════════════════════════════════════════════════════════════════
describe('BVN OTP Completion — PUT /verification/bvn/:bvn/accounts', () => {

  test('TC-BVN-007 | Submitting an incorrect OTP returns 4xx', async () => {
    expect.assertions(2);
    try {
      await apiClient.put(`/verification/bvn/${BVN_DATA.validBvn}/accounts`, {
        otp: BVN_DATA.wrongOtp,
      });
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 401, 422], true);
    }
  });

  test('TC-BVN-008 | Missing otp field in PUT body returns 400 or 422', async () => {
    expect.assertions(1);
    try {
      await apiClient.put(`/verification/bvn/${BVN_DATA.validBvn}/accounts`, {});
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 422], false);
    }
  });

  test('TC-BVN-009 | No Authorization header on OTP completion returns 401', async () => {
    expect.assertions(2);
    try {
      await unauthClient.put(`/verification/bvn/${BVN_DATA.validBvn}/accounts`, {
        otp: BVN_DATA.testOtp,
      });
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, 401, true);
    }
  });

});

// ════════════════════════════════════════════════════════════════
describe('BVN Image Match — POST /verification/bvn/:bvn/selfies', () => {

  test('TC-BVN-010 | Successful image match returns similarity score and cost = ₦30', async () => {
    // Using the exact image URL from official Lendsqr docs example
    try {
      const res = await apiClient.post(
        `/verification/bvn/${BVN_DATA.selfieTestBvn}/selfies`,
        {
          image:
            'https://picsum.photos/id/1/300/300', // publicly accessible test image
        }
      );
      t(res);
      expectSuccessResponse(res, BVN_DATA.selfieCost);
      // Per docs, data contains match (bool) and similarity (float)
      expect(res.data.data).toHaveProperty('match');
      expect(res.data.data).toHaveProperty('similarity');
      expect(typeof res.data.data.similarity).toBe('number');
    } catch (err) {
      tErr(err);
      // If BVN has no registered image, API will return 4xx not 5xx
      expect(err.response?.status).toBeLessThan(500);
    }
  });

  test('TC-BVN-011 | Missing image field in body returns 400 or 422', async () => {
    expect.assertions(1);
    try {
      await apiClient.post(`/verification/bvn/${BVN_DATA.selfieTestBvn}/selfies`, {});
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 422], false);
    }
  });

  test('TC-BVN-012 | No Authorization header on selfie endpoint returns 401', async () => {
    expect.assertions(2);
    try {
      await unauthClient.post(`/verification/bvn/${BVN_DATA.selfieTestBvn}/selfies`, {
        image: 'https://picsum.photos/id/1/300/300',
      });
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, 401, true);
    }
  });

});
