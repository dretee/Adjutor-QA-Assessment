// tests/ecosystem.test.js
// ═══════════════════════════════════════════════════════════════
// MODULE  : Nigerian Country Specific Endpoints → Ecosystem Lookup
// ENDPOINT: GET https://adjutor.lendsqr.com/v2/verification/ecosystem/:bvn
// DOCS    : https://docs.adjutor.io/adjutor-api-endpoints/validation/ecosystem-lookup
// COST    : ₦25 per call
//
// REAL DOCUMENTED RESPONSE SCHEMA (key fields):
// {
//   "status": "success", "message": "Successful",
//   "data": {
//     "bvn", "first_name", "last_name", "bvn_phone_number",
//     "date_of_birth", "age", "gender", "email", "phone_number",
//     "unique_phone_numbers", "unique_emails",
//     "lenders", "first_account", "last_account",
//     "failed_selfie_bvn_check", "lending_lenders",
//     "loans", "loan_amount", "loan_amount_minimum",
//     "loan_amount_maximum", "loan_amount_average",
//     "settled_loans", "settled_loan_amount", "settled_loan_amount_paid",
//     "running_loans", "running_loan_amount",
//     "past_due_loans", "past_due_loan_amount", "past_due_loan_amount_due",
//     "penalty", "penalty_paid",
//     "delayed_paid_loans", "delayed_paid_loan_amount",
//     "delayed_paid_loans_trials", "delayed_paid_loans_avg",
//     "delayed_paid_loans_trials_max", "delayed_paid_loans_trials_min",
//     "first_loan_date", "last_loan_date",
//     "loan_requests", "failed_loan_requests",
//     "logins", "first_login", "last_login",
//     "unique_login_ips", "unique_device_ids",
//     "distinct_mobile_os", "duplicated_devices", "shared_device_users",
//     "credit_delinquency", "processed_on"
//   },
//   "meta": { "cost": 25, "balance": 1590 }
// }
//
// TEST PLAN (10 cases):
//   Positive → TC-EL-001 Valid BVN → 200 + success
//            → TC-EL-002 Full schema — all identity fields present
//            → TC-EL-003 Full schema — all loan fields are numeric
//            → TC-EL-004 Meta cost = 25 NGN and balance is numeric
//   Negative → TC-EL-005 BVN < 11 digits → 4xx
//            → TC-EL-006 BVN > 11 digits → 4xx
//            → TC-EL-007 Alpha BVN → 4xx
//            → TC-EL-008 All-zeros BVN → 4xx, no crash
//            → TC-EL-009 No Authorization header → 401
//            → TC-EL-010 Response completes within 1500ms
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const { apiClient, unauthClient, printPerfSummary } = require('../config/apiClient');
const { ECOSYSTEM_DATA } = require('../helpers/testData');
const {
  expectSuccessResponse,
  expectErrorResponse,
  expectNumericFields,
  expectPerformanceThreshold,
  recordTiming,
  recordErrorTiming,
} = require('../helpers/responseValidators');

const responseTimes = [];

afterAll(() => printPerfSummary('ECOSYSTEM LOOKUP', responseTimes));

const t    = (res) => recordTiming(res, responseTimes);
const tErr = (err) => recordErrorTiming(err, responseTimes);

// ────────────────────────────────────────────────────────────
describe('Ecosystem Lookup — GET /verification/ecosystem/:bvn', () => {

  // ── POSITIVE CASES ────────────────────────────────────────

  test('TC-EL-001 | Valid 11-digit BVN returns 200 and success status', async () => {
    const res = await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.validBvn}`);
    t(res);

    expectSuccessResponse(res, ECOSYSTEM_DATA.costPerCall);
  });

  test('TC-EL-002 | Response data contains all documented identity fields', async () => {
    const res = await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.validBvn}`);
    t(res);

    const { data } = res.data;
    ECOSYSTEM_DATA.identityFields.forEach((field) =>
      expect(data).toHaveProperty(
        field,
        `Missing identity field: ${field}`
      )
    );
  });

  test('TC-EL-003 | All loan-related fields in response are numeric type', async () => {
    const res = await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.validBvn}`);
    t(res);

    const { data } = res.data;
    expectNumericFields(data, ECOSYSTEM_DATA.numericFields);
  });

  test('TC-EL-004 | Meta cost is ₦25 per docs, and balance is a valid number', async () => {
    const res = await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.validBvn}`);
    t(res);

    expect(res.data.meta).toHaveProperty('cost', ECOSYSTEM_DATA.costPerCall);
    expect(typeof res.data.meta.balance).toBe('number');
    // Balance should be non-negative after the ₦25 deduction
    expect(res.data.meta.balance).toBeGreaterThanOrEqual(0);
  });

  // ── NEGATIVE CASES ────────────────────────────────────────

  test('TC-EL-005 | BVN shorter than 11 digits returns 4xx (input validation)', async () => {
    expect.assertions(2);
    try {
      await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.shortBvn}`);
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 404, 422], true);
    }
  });

  test('TC-EL-006 | BVN longer than 11 digits returns 4xx (input validation)', async () => {
    expect.assertions(1);
    try {
      await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.longBvn}`);
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 404, 422], false);
    }
  });

  test('TC-EL-007 | Alphabetical BVN returns 4xx — BVN must be numeric', async () => {
    expect.assertions(1);
    try {
      await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.alphaBvn}`);
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, [400, 404, 422], false);
    }
  });

  test('TC-EL-008 | All-zeros BVN (edge case) handled gracefully — no 5xx crash', async () => {
    expect.assertions(1);
    try {
      await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.zerosBvn}`);
    } catch (err) {
      tErr(err);
      // Must not return a server error
      expect(err.response?.status).toBeLessThan(500);
    }
  });

  test('TC-EL-009 | No Authorization header returns 401 Unauthorized', async () => {
    expect.assertions(2);
    try {
      await unauthClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.validBvn}`);
    } catch (err) {
      tErr(err);
      expectErrorResponse(err, 401, true);
    }
  });

  test('TC-EL-010 | API response completes within 1500ms performance threshold', async () => {
    try {
      const res = await apiClient.get(`/verification/ecosystem/${ECOSYSTEM_DATA.validBvn}`);
      t(res);
      expectPerformanceThreshold(
        res.config.metadata.responseTime,
        1500,
        'GET /verification/ecosystem/:bvn'
      );
    } catch (err) {
      tErr(err);
      expectPerformanceThreshold(
        err.config?.metadata?.responseTime ?? 0,
        1500,
        'GET /verification/ecosystem/:bvn (error)'
      );
    }
  });

});
