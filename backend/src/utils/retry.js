/**
 * Retry utility with exponential backoff and jitter
 * Designed specifically for transient AI model errors (503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED).
 */

/**
 * Checks if an error is transient and eligible for retry.
 * @param {Error|Object} error
 * @returns {boolean}
 */
export function isTransientError(error) {
  if (!error) return false;

  // Check HTTP status code
  const status = error.status || error.statusCode || error.code;

  if ([429, 500, 503, 504].includes(Number(status))) {
    return true;
  }

  // Check error message content
  const msg = typeof error.message === 'string' ? error.message : JSON.stringify(error);
  const transientPatterns = [
    '503',
    '429',
    'UNAVAILABLE',
    'RESOURCE_EXHAUSTED',
    'high demand',
    'overloaded',
    'temporarily unavailable',
    'ECONNRESET',
    'ETIMEDOUT',
    'fetch failed',
    'DEADLINE_EXCEEDED',
    'deadline expired before operation could complete',
  ];

  return transientPatterns.some((pattern) => msg.includes(pattern));
}

/**
 * Executes an async operation with up to maxRetries on transient errors.
 *
 * @param {Function} operation - Async function to execute
 * @param {Object} options
 * @param {number} [options.maxRetries=3] - Maximum number of retries (1 initial + up to 3 retries)
 * @param {number} [options.initialDelayMs=1000] - Base delay in milliseconds
 * @param {number} [options.backoffFactor=2] - Multiplier for exponential backoff
 * @param {string} [options.operationName='Gemini API'] - Label for diagnostic logging
 * @returns {Promise<*>}
 */
export async function callWithRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    backoffFactor = 2,
    operationName = 'Gemini API'
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt++;

      // If max retries reached or error is not transient, rethrow with friendly message
      if (attempt > maxRetries || !isTransientError(error)) {
        if (isTransientError(error)) {
          const friendlyError = new Error(
            'Our AI customer support is currently experiencing high demand. Please try again in a few moments.'
          );
          friendlyError.status = 503;
          friendlyError.originalError = error;
          throw friendlyError;
        }
        throw error;
      }

      // Calculate exponential backoff delay with random jitter (0 - 300ms)
      const baseDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
      const jitter = Math.floor(Math.random() * 300);
      const delay = baseDelay + jitter;

      console.warn(
        `[${operationName}] Transient error encountered (503/429/high demand). Retry attempt ${attempt} of ${maxRetries} in ${delay}ms...`
      );

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export default {
  isTransientError,
  callWithRetry
};
