/**
 * Request validation utilities for voice agent endpoints
 */

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_LENGTH = 20;

/**
 * Validates and sanitizes a customer message
 * @param {*} message
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validateMessage(message) {
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string.' };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty.' };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message exceeds maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`
    };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validates and normalizes conversation history
 * Supported roles: 'user' and 'agent' (or 'model' / 'assistant')
 * @param {*} history
 * @returns {{ valid: boolean, error?: string, sanitized?: Array }}
 */
export function validateHistory(history) {
  if (history === undefined || history === null) {
    return { valid: true, sanitized: [] };
  }

  if (!Array.isArray(history)) {
    return { valid: false, error: 'History must be an array of messages.' };
  }

  // Cap at the most recent MAX_HISTORY_LENGTH items
  const recentHistory = history.slice(-MAX_HISTORY_LENGTH);
  const sanitized = [];

  for (let i = 0; i < recentHistory.length; i++) {
    const item = recentHistory[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Invalid history item at index ${i}.` };
    }

    const role = item.role;
    const text = item.text || item.content || item.message;

    if (!role || typeof role !== 'string') {
      return { valid: false, error: `Missing or invalid role in history item at index ${i}.` };
    }

    const normalizedRole = role.toLowerCase();
    if (!['user', 'agent', 'model', 'assistant'].includes(normalizedRole)) {
      return { valid: false, error: `Unsupported role '${role}' at index ${i}.` };
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return { valid: false, error: `Missing or empty message text at index ${i}.` };
    }

    // Map to canonical user/model roles for Gemini
    sanitized.push({
      role: normalizedRole === 'user' ? 'user' : 'model',
      text: text.trim().slice(0, MAX_MESSAGE_LENGTH)
    });
  }

  return { valid: true, sanitized };
}

/**
 * Validates summary generation request payload
 * @param {*} transcript
 * @returns {{ valid: boolean, error?: string, sanitized?: Array }}
 */
export function validateSummaryRequest(transcript) {
  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return {
      valid: false,
      error: 'A non-empty transcript array is required to generate a call summary.'
    };
  }

  return validateHistory(transcript);
}

export default {
  validateMessage,
  validateHistory,
  validateSummaryRequest
};
