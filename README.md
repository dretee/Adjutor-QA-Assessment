<<<<<<< HEAD
# Adjutor-QA-Assessment
=======
# Adjutor API — Automated QA Test Suite
### Capital Credit Limited | Capital Cash Application
**Platform Under Test:** Lendsqr Adjutor API (`adjutor.lendsqr.com/v2`)  
**Currency Context:** Nigerian Naira (NGN ₦)  
**Framework:** Node.js · Jest · Axios  
**Assessment Scope:** Nigerian Country Specific Endpoints

---

## Project Structure

```
adjutor-qa/
├── config/
│   └── apiClient.js           # Shared Axios instance — auth, timing interceptors, perf helper
├── tests/
│   ├── karma.test.js          # Karma Lookup          — 10 test cases
│   ├── ecosystem.test.js      # Ecosystem Lookup      — 10 test cases
│   ├── bvn.test.js            # BVN Verification      — 12 test cases
│   └── bankaccount.test.js    # Bank Account Verify   — 12 test cases
├── reports/
│   └── test-results-summary.md  # Human-readable pass/fail summary
├── .env.example               # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v18 or higher |
| npm | v9 or higher |
| Adjutor API Key | From [app.adjutor.io](https://app.adjutor.io) |

---

## Setup — Step by Step

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/adjutor-api-qa.git
cd adjutor-api-qa
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your environment
```bash
cp .env.example .env
```

Open `.env` and paste your Adjutor API key:
```env
ADJUTOR_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxx
BASE_URL=https://adjutor.lendsqr.com/v2
CURRENCY=NGN
```

> **How to get your API key:**  
> 1. Sign up at [app.adjutor.io/signup](https://app.adjutor.io/signup)  
> 2. Navigate to **Apps → Create App**  
> 3. Name your app (e.g. "Capital Cash"), set currency to **NGN**  
> 4. Select the required API scopes  
> 5. Copy the generated API key — it is shown **only once**

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

## Running the Tests

### Run all modules at once
```bash
npm test
```

### Run a single module
```bash
npm run test:karma          # Karma Lookup only
npm run test:ecosystem      # Ecosystem Lookup only
npm run test:bvn            # BVN Verification only
npm run test:bankaccount    # Bank Account Verification only
```

### Run with JSON output (CI/CD)
```bash
npm run test:ci
# Output written to reports/jest-results.json
```

### Verbose mode (see every assertion)
```bash
npx jest --runInBand --verbose
```

---

## What Each Test Validates

Every test case validates **two things** as required by the assessment:

| Validation | What is checked |
|---|---|
| **HTTP Status Code** | Exact expected code (200, 400, 401, 404, 422) |
| **Response Body / Message** | `status`, `message`, field presence, data types, pricing (NGN cost) |

Additional validations per suite:
- Full schema check against official Lendsqr documentation
- Data type enforcement (numeric fields are `number`, not string)
- API cost assertions (₦10 Karma, ₦25 Ecosystem, ₦0 BVN init, ₦20 BVN complete, ₦30 Selfie, ₦10 Bank Account)
- Performance threshold (response time < 1500ms per test)
- Server stability (no 5xx on any malformed input)

---

## Test Results Summary

See [`reports/test-results-summary.md`](reports/test-results-summary.md) for the full pass/fail breakdown.

**Quick stats:**

| Module | Total TCs | Auth-Independent Passes | Auth-Gated |
|---|---|---|---|
| Karma Lookup | 10 | 5 | 5 |
| Ecosystem Lookup | 10 | 6 | 4 |
| BVN Verification | 12 | 7 | 5 |
| Bank Account Verification | 12 | 8 | 4 |
| **TOTAL** | **44** | **26** | **18** |

> **Auth-gated** tests require a live API key and wallet balance to execute fully.  
> **Auth-independent** tests (401 enforcement, input validation, server stability) pass without any key.

---

## Performance Output

After each test suite, the runner automatically prints a performance summary:

```
📊 KARMA LOOKUP — Response Time Summary
   Min: 182ms  |  Avg: 374ms  |  Max: 601ms
   Rating: ⚠️  Acceptable (200–500ms)

📊 ECOSYSTEM LOOKUP — Response Time Summary
   Min: 398ms  |  Avg: 531ms  |  Max: 872ms
   Rating: 🔶 Slow (500ms–1s)
```

Performance bands used:

| Rating | Avg Response Time |
|---|---|
| ✅ Excellent | < 200ms |
| ⚠️ Acceptable | 200 – 500ms |
| 🔶 Slow | 500ms – 1s |
| 🔴 Poor | > 1s |

---

## Notes

- All tests use `--runInBand` to avoid parallel requests hitting rate limits
- `unauthClient` in `apiClient.js` sends requests **without** an `Authorization` header — used exclusively for 401 negative test cases
- The `dotenv` package reads `.env` automatically at test start
- Dummy/placeholder data is used where KYC documents are required, as permitted by the assessment brief
- BVN test values are either from official Lendsqr documentation samples or fictional 11-digit values

---

## Dependencies

```json
{
  "axios": "^1.6.8",
  "dotenv": "^16.4.5",
  "jest": "^29.7.0"
}
```
>>>>>>> 41b364e (Initial Commit)
