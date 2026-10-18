import { validateMessage, validateHistory, validateSummaryRequest } from '../utils/validation.js';
import { generateVoiceResponse } from '../services/geminiService.js';
import { generateCallSummary } from '../services/summaryService.js';
import { MOCK_ORDERS } from '../data/mockData.js';
import { isGeminiConfigured } from '../config/gemini.js';

/**
 * Health check endpoint
 * GET /api/health
 */
export function healthCheck(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'aura-skincare-voice-agent',
    timestamp: new Date().toISOString(),
    geminiConfigured: isGeminiConfigured()
  });
}

/**
 * Handle incoming voice/text chat messages
 * POST /api/voice/chat
 */
export async function handleChatMessage(req, res, next) {
  try {
    const { message, history } = req.body;

    // Validate customer message
    const msgValidation = validateMessage(message);
    if (!msgValidation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: msgValidation.error
      });
    }

    // Validate history context
    const histValidation = validateHistory(history);
    if (!histValidation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: histValidation.error
      });
    }

    const result = await generateVoiceResponse(
      msgValidation.sanitized,
      histValidation.sanitized
    );

    return res.status(200).json({
      reply: result.reply,
      toolUsed: result.toolUsed,
      orderId: result.orderId || null
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle post-call summary generation
 * POST /api/voice/summary
 */
export async function handleCallSummary(req, res, next) {
  try {
    const { transcript } = req.body;

    const validation = validateSummaryRequest(transcript);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error
      });
    }

    const summary = await generateCallSummary(validation.sanitized);

    return res.status(200).json({
      summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Return authoritative mock orders for test helper
 * GET /api/voice/orders
 */
export function getMockOrders(req, res) {
  res.status(200).json({
    orders: MOCK_ORDERS
  });
}

export default {
  healthCheck,
  handleChatMessage,
  handleCallSummary,
  getMockOrders
};
