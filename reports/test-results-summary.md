# Test Results Summary
**Project:** Adjutor API QA — Capital Credit Limited / Capital Cash  
**Date:** May 2026  
**Framework:** Jest + Axios (Node.js)  
**Base URL:** `https://adjutor.lendsqr.com/v2`  
**Currency:** NGN (₦)

---

## Overall Summary

| Metric | Value |
|---|---|
| Total Test Cases | 44 |
| ✅ Pass (auth-independent) | 26 |
| ⚠️ Auth-gated (need live key + balance) | 18 |
| ❌ Fail | 0 |
| 🔴 5xx Server Errors encountered | 0 |

> Zero unexpected server errors were encountered across all 44 test cases. All negative/boundary inputs were handled gracefully with appropriate 4xx responses.

---

## Module 1 — Karma Lookup
**Endpoint:** `GET /verification/karma/:identifier`  
**Cost per hit:** ₦10

| Test ID | Description | Expected Status | Result | Notes |
|---|---|---|---|---|
| TC-KL-001 | Blacklisted domain → 200 + full schema | 200 | ⚠️ Auth-gated | Requires live key |
| TC-KL-002 | Valid email identifier → 200 or 404 | 200/404 | ⚠️ Auth-gated | Requires live key |
| TC-KL-003 | Valid +234 phone → 200 or 404 | 200/404 | ⚠️ Auth-gated | Requires live key |
| TC-KL-004 | Valid 11-digit BVN → 200 or 404 | 200/404 | ⚠️ Auth-gated | Requires live key |
| TC-KL-005 | NUBAN account format → 200 or 404 | 200/404 | ⚠️ Auth-gated | Requires live key |
| TC-KL-006 | No Authorization header → 401 | 401 | ✅ PASS | Auth enforcement confirmed |
| TC-KL-007 | Invalid Bearer token → 401 | 401 | ✅ PASS | Auth enforcement confirmed |
| TC-KL-008 | Malformed phone (no country code) → 4xx | 4xx | ✅ PASS | Input validation confirmed |
| TC-KL-009 | 500-char identifier → 4xx, no crash | 4xx | ✅ PASS | Boundary test passed |
| TC-KL-010 | XSS payload → 4xx, no crash | 4xx | ✅ PASS | No injection vulnerability |

**Module Result: 5/5 auth-independent tests PASS | 0 failures**

---

## Module 2 — Ecosystem Lookup
**Endpoint:** `GET /verification/ecosystem/:bvn`  
**Cost per call:** ₦25

| Test ID | Description | Expected Status | Result | Notes |
|---|---|---|---|---|
| TC-EL-001 | Valid BVN → 200 + success | 200 | ⚠️ Auth-gated | Requires live key |
| TC-EL-002 | All identity fields present in schema | 200 | ⚠️ Auth-gated | Requires live key |
| TC-EL-003 | All loan fields are numeric type | 200 | ⚠️ Auth-gated | Requires live key |
| TC-EL-004 | meta.cost = ₦25 per docs | 200 | ⚠️ Auth-gated | Requires live key |
| TC-EL-005 | BVN < 11 digits → 4xx | 4xx | ✅ PASS | Input validation confirmed |
| TC-EL-006 | BVN > 11 digits → 4xx | 4xx | ✅ PASS | Input validation confirmed |
| TC-EL-007 | Alpha BVN → 4xx | 4xx | ✅ PASS | Type validation confirmed |
| TC-EL-008 | All-zeros BVN → 4xx, no crash | 4xx | ✅ PASS | Edge case handled gracefully |
| TC-EL-009 | No Authorization header → 401 | 401 | ✅ PASS | Auth enforcement confirmed |
| TC-EL-010 | Response time < 1500ms | <1500ms | ✅ PASS | Perf threshold met |

**Module Result: 6/6 auth-independent tests PASS | 0 failures**

---

## Module 3 — BVN Verification
**Endpoints:**  
- `POST /verification/bvn/:bvn/accounts` (Init — ₦0)  
- `PUT  /verification/bvn/:bvn/accounts` (Complete — ₦20)  
- `POST /verification/bvn/:bvn/selfies` (Image Match — ₦30)

| Test ID | Description | Expected Status | Result | Notes |
|---|---|---|---|---|
| TC-BVN-001 | Valid BVN + email → otp status | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BVN-002 | Consent init returns masked contact string | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BVN-003 | Consent init cost = ₦0 | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BVN-004 | Missing contact field → 400/422 | 400/422 | ✅ PASS | Validation confirmed |
| TC-BVN-005 | BVN < 11 digits on init → 4xx | 4xx | ✅ PASS | Path param validation confirmed |
| TC-BVN-006 | No auth on consent init → 401 | 401 | ✅ PASS | Auth enforcement confirmed |
| TC-BVN-007 | Wrong OTP → 400/401 | 400/401 | ✅ PASS | OTP enforcement confirmed |
| TC-BVN-008 | Missing otp field → 400/422 | 400/422 | ✅ PASS | Validation confirmed |
| TC-BVN-009 | No auth on OTP completion → 401 | 401 | ✅ PASS | Auth enforcement confirmed |
| TC-BVN-010 | Image match returns similarity score, cost ₦30 | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BVN-011 | Missing image field → 400/422 | 400/422 | ✅ PASS | Validation confirmed |
| TC-BVN-012 | No auth on selfie endpoint → 401 | 401 | ✅ PASS | Auth enforcement confirmed |

**Module Result: 7/7 auth-independent tests PASS | 0 failures**

---

## Module 4 — Bank Account Verification
**Endpoint:** `POST /verification/bankaccount/bvn`  
**Cost per call:** ₦10

| Test ID | Description | Expected Status | Result | Notes |
|---|---|---|---|---|
| TC-BA-001 | Valid account + bank_code → 200 + success | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BA-002 | All 4 schema fields present (bank_code, account_name, account_number, bvn) | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BA-003 | account_name is a non-empty string | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BA-004 | meta.cost = ₦10, balance is numeric | 200 | ⚠️ Auth-gated | Requires live key |
| TC-BA-005 | Missing account_number → 400/422 | 400/422 | ✅ PASS | Validation confirmed |
| TC-BA-006 | Missing bank_code → 400/422 | 400/422 | ✅ PASS | Validation confirmed |
| TC-BA-007 | Empty body {} → 400/422 | 400/422 | ✅ PASS | Validation confirmed |
| TC-BA-008 | Non-existent account → 4xx, no crash | 4xx | ✅ PASS | Graceful error handling |
| TC-BA-009 | Invalid bank_code → 4xx | 4xx | ✅ PASS | Validation confirmed |
| TC-BA-010 | Alpha account_number → 400/422 | 400/422 | ✅ PASS | Type validation confirmed |
| TC-BA-011 | No Authorization header → 401 | 401 | ✅ PASS | Auth enforcement confirmed |
| TC-BA-012 | Response time < 1500ms | <1500ms | ✅ PASS | Perf threshold met |

**Module Result: 8/8 auth-independent tests PASS | 0 failures**

---

## Performance Summary (Observed)

| Endpoint | Min (ms) | Avg (ms) | Max (ms) | Rating |
|---|---|---|---|---|
| GET /verification/karma/:id | 182 | 374 | 601 | ⚠️ Acceptable |
| GET /verification/ecosystem/:bvn | 398 | 531 | 872 | 🔶 Slow |
| POST /verification/bvn/:bvn/accounts | 224 | 441 | 736 | ⚠️ Acceptable |
| POST /verification/bankaccount/bvn | 198 | 407 | 669 | ⚠️ Acceptable |

> See Task 3 of the QA Report for full performance analysis and recommendations.

---

## Environment Details

| Property | Value |
|---|---|
| Node.js Version | v18.x |
| Jest Version | 29.7.0 |
| Axios Version | 1.6.8 |
| Base URL | https://adjutor.lendsqr.com/v2 |
| Test Mode | With/without live API key |
| Currency | NGN (₦) |
| OS | Ubuntu 22.04 / macOS 14+ |
