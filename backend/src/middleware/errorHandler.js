/**
 * Centralized Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[Backend Error]:', err.message || err);

  const statusCode = err.statusCode || err.status || (err.isConfigError ? 503 : 500);

  let userMessage = err.message || 'An unexpected internal error occurred.';

  // Check if error message is raw JSON from SDK (e.g. {"error":{"code":503,...}})
  if (typeof userMessage === 'string' && userMessage.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(userMessage);
      if (parsed.error?.message) {
        userMessage = parsed.error.message;
      }
    } catch {
      // Keep original message if parsing fails
    }
  }

  // Friendly error messages for common scenarios
  if (err.isConfigError || userMessage?.includes('GEMINI_API_KEY')) {
    userMessage = 'Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env.';
  } else if (
    statusCode === 503 ||
    userMessage?.includes('503') ||
    userMessage?.includes('UNAVAILABLE') ||
    userMessage?.includes('high demand')
  ) {
    userMessage = 'Our AI customer support is currently experiencing temporary high demand. Please try again in a few moments.';
  } else if (
    statusCode === 429 ||
    userMessage?.includes('429') ||
    userMessage?.includes('RESOURCE_EXHAUSTED')
  ) {
    userMessage = 'We are receiving a high volume of requests right now. Please wait a moment and try again.';
  }

  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: userMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export default errorHandler;
