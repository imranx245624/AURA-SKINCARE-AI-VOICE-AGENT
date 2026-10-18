import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

let aiInstance = null;

/**
 * Returns an initialized GoogleGenAI client instance.
 * Throws a helpful error if GEMINI_API_KEY is missing.
 */
export function getGeminiClient() {
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const error = new Error('GEMINI_API_KEY is not configured in backend/.env');
    error.statusCode = 500;
    error.isConfigError = true;
    throw error;
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 20000,
        retryOptions: {
          attempts: 1
        }
      }
    });
  }

  return aiInstance;
}

export function isGeminiConfigured() {
  return Boolean(apiKey && apiKey !== 'your_gemini_api_key_here');
}

export function getGeminiModel() {
  return modelName;
}

/**
 * Returns prioritized list of models to try (primary + healthy fallbacks)
 */
export function getModelCascade() {
  const primary = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  return [...new Set([
    primary,
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite'
  ])];
}

export default {
  getGeminiClient,
  isGeminiConfigured,
  getGeminiModel,
  getModelCascade
};
