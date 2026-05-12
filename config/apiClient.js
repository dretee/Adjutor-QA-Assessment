// config/apiClient.js
// ─────────────────────────────────────────────────────────
// Shared HTTP client for all Adjutor API test suites.
// Sets the Bearer token, base URL, and timeout once
// so individual test files stay DRY.
//
// Also instruments every request with a high-resolution
// timer so test suites can emit performance data.
// ─────────────────────────────────────────────────────────

require('dotenv').config();
const axios = require('axios');
const Logger = require('./logger');
const { HTTP_CONFIG, PERFORMANCE, ERROR_MESSAGES } = require('./constants');

const logger = new Logger('API-Client');

const API_KEY  = process.env.ADJUTOR_API_KEY || '';
const BASE_URL = process.env.BASE_URL || 'https://adjutor.lendsqr.com/v2';

if (!API_KEY || API_KEY === 'PASTE_YOUR_KEY_HERE') {
  const warning = ERROR_MESSAGES.MISSING_API_KEY;
  logger.warn(warning);
  console.warn(
    '\n⚠️  WARNING: ' + warning + '\n' +
    '   Copy .env.example → .env and paste your key.\n' +
    '   Auth-independent tests (401 checks, input validation)\n' +
    '   will still run and pass without a key.\n'
  );
}

// ── Authenticated client (used for all live endpoint calls) ──
const apiClient = axios.create({
  baseURL : BASE_URL,
  timeout : HTTP_CONFIG.REQUEST_TIMEOUT_MS,
  headers : {
    'Content-Type' : HTTP_CONFIG.DEFAULT_HEADERS['Content-Type'],
    'Authorization': `${HTTP_CONFIG.BEARER_PREFIX}${API_KEY}`,
  },
});

// ── Unauthenticated client (negative auth test cases only) ──
const unauthClient = axios.create({
  baseURL : BASE_URL,
  timeout : HTTP_CONFIG.REQUEST_TIMEOUT_MS,
  headers : { 'Content-Type': HTTP_CONFIG.DEFAULT_HEADERS['Content-Type'] },
});

// ── Request timer interceptor ────────────────────────────────
// Attaches a start timestamp; response interceptor calculates
// elapsed ms and stores it at response.config.metadata.responseTime.
function attachTimer(instance) {
  instance.interceptors.request.use((config) => {
    config.metadata = { startTime: Date.now() };
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      response.config.metadata.responseTime =
        Date.now() - response.config.metadata.startTime;
      return response;
    },
    (error) => {
      if (error.config?.metadata) {
        error.config.metadata.responseTime =
          Date.now() - error.config.metadata.startTime;
      }
      return Promise.reject(error);
    }
  );
}

attachTimer(apiClient);
attachTimer(unauthClient);

// ── Performance rating helper (used in afterAll summaries) ──
function perfRating(avgMs) {
  if (avgMs < PERFORMANCE.EXCELLENT)    return PERFORMANCE.RATINGS.EXCELLENT;
  if (avgMs < PERFORMANCE.ACCEPTABLE)   return PERFORMANCE.RATINGS.ACCEPTABLE;
  if (avgMs < PERFORMANCE.SLOW)         return PERFORMANCE.RATINGS.SLOW;
  return PERFORMANCE.RATINGS.POOR;
}

// ── Perf summary printer ─────────────────────────────────────
function printPerfSummary(label, times) {
  if (!times.length) return;
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const min = Math.min(...times);
  const max = Math.max(...times);
  console.log(`\n📊 ${label} — Response Time Summary`);
  console.log(`   Min: ${min}ms  |  Avg: ${avg}ms  |  Max: ${max}ms`);
  console.log(`   Rating: ${perfRating(avg)}\n`);
  logger.info(`${label} performance summary`, { min, avg, max, rating: perfRating(avg) });
}

module.exports = { apiClient, unauthClient, BASE_URL, printPerfSummary };
