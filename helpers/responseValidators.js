// helpers/responseValidators.js
// ─────────────────────────────────────────────────────────
// Reusable response validation helpers to eliminate duplication
// across test suites and enforce consistent schema checking.
// ─────────────────────────────────────────────────────────

/**
 * Validates standard successful API response structure
 * @param {Object} response - Axios response object
 * @param {number} expectedCost - Expected cost in NGN (optional)
 * @param {string} expectedStatus - Expected status field value, default 'success'
 * @param {string} expectedMessage - Expected message value, default 'Successful'
 */
function expectSuccessResponse(
  response,
  expectedCost = null,
  expectedStatus = 'success',
  expectedMessage = 'Successful'
) {
  expect(response.status).toBe(200);
  expect(response.data.status).toBe(expectedStatus);
  expect(response.data.message).toBe(expectedMessage);
  expect(response.data).toHaveProperty('data');
  expect(response.data).toHaveProperty('meta');

  if (expectedCost !== null) {
    expect(response.data.meta.cost).toBe(expectedCost);
  }

  // Balance should always be a non-negative number
  expect(typeof response.data.meta.balance).toBe('number');
  expect(response.data.meta.balance).toBeGreaterThanOrEqual(0);
}

/**
 * Validates OTP response structure (BVN consent init)
 * @param {Object} response - Axios response object
 */
function expectOtpResponse(response) {
  expect(response.status).toBe(200);
  expect(response.data.status).toBe('otp');
  expect(response.data.message).toMatch(/OTP/i);
  // data field contains masked phone/email contact string
  expect(typeof response.data.data).toBe('string');
  expect(response.data.data.length).toBeGreaterThan(0);
  expect(response.data).toHaveProperty('meta');
  // BVN init is free per docs
  expect(response.data.meta.cost).toBe(0);
}

/**
 * Validates error response structure
 * @param {Object} error - Axios error object
 * @param {number|Array<number>} expectedStatus - Expected HTTP status code(s)
 * @param {boolean} shouldHaveMessage - Whether error response should have message field
 */
function expectErrorResponse(error, expectedStatus, shouldHaveMessage = true) {
  const statusArray = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  expect(statusArray).toContain(error.response?.status);

  if (shouldHaveMessage) {
    expect(error.response?.data).toHaveProperty('message');
  }

  // Ensure no unexpected 5xx errors
  expect(error.response?.status).toBeLessThan(500);
}

/**
 * Validates schema field exists with correct type
 * @param {Object} obj - Object to validate
 * @param {string} fieldName - Field name to check
 * @param {string} expectedType - Expected typeof value (e.g., 'string', 'number')
 * @param {string} contextMsg - Error context message
 */
function expectFieldType(obj, fieldName, expectedType, contextMsg = '') {
  expect(obj).toHaveProperty(
    fieldName,
    contextMsg ? `${contextMsg} — Missing field: ${fieldName}` : undefined
  );
  expect(typeof obj[fieldName]).toBe(
    expectedType,
    contextMsg
      ? `${contextMsg} — ${fieldName} should be ${expectedType} but got ${typeof obj[fieldName]}`
      : undefined
  );
}

/**
 * Validates all fields in an array exist with correct type
 * @param {Object} obj - Object to validate
 * @param {Object} fieldsMap - { fieldName: expectedType, ... }
 * @param {string} contextMsg - Error context message
 */
function expectAllFieldTypes(obj, fieldsMap, contextMsg = '') {
  Object.entries(fieldsMap).forEach(([fieldName, expectedType]) => {
    expectFieldType(obj, fieldName, expectedType, contextMsg);
  });
}

/**
 * Validates performance threshold
 * @param {number} responseTimeMs - Response time in milliseconds
 * @param {number} maxThresholdMs - Maximum acceptable response time
 * @param {string} endpointName - Endpoint name for error message
 */
function expectPerformanceThreshold(responseTimeMs, maxThresholdMs = 1500, endpointName = '') {
  expect(responseTimeMs).toBeLessThan(
    maxThresholdMs,
    `${endpointName} response time ${responseTimeMs}ms exceeded threshold ${maxThresholdMs}ms`
  );
}

/**
 * Validates numeric financial fields
 * @param {Object} data - Data object containing financial fields
 * @param {Array<string>} fieldNames - Array of field names to validate
 */
function expectNumericFields(data, fieldNames) {
  fieldNames.forEach((fieldName) => {
    expect(typeof data[fieldName]).toBe(
      'number',
      `Field '${fieldName}' should be numeric, not ${typeof data[fieldName]}`
    );
  });
}

/**
 * Validates string field is non-empty
 * @param {string} value - String value to validate
 * @param {string} fieldName - Field name for error message
 */
function expectNonEmptyString(value, fieldName = 'field') {
  expect(typeof value).toBe('string');
  expect(value.trim().length).toBeGreaterThan(
    0,
    `${fieldName} should not be empty`
  );
}

/**
 * Records response timing from successful response
 * @param {Object} response - Axios response object
 * @param {Array<number>} timingsArray - Array to push timing into
 */
function recordTiming(response, timingsArray) {
  timingsArray.push(response.config?.metadata?.responseTime ?? 0);
}

/**
 * Records response timing from error response
 * @param {Object} error - Axios error object
 * @param {Array<number>} timingsArray - Array to push timing into
 */
function recordErrorTiming(error, timingsArray) {
  timingsArray.push(error.config?.metadata?.responseTime ?? 0);
}

module.exports = {
  expectSuccessResponse,
  expectOtpResponse,
  expectErrorResponse,
  expectFieldType,
  expectAllFieldTypes,
  expectPerformanceThreshold,
  expectNumericFields,
  expectNonEmptyString,
  recordTiming,
  recordErrorTiming,
};
