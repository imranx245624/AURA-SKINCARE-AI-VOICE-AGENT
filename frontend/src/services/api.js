import axios from 'axios';

// Get backend API base URL from Vite environment or default to local proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60s – accounts for up to 3 backend retries with exponential backoff
});

/**
 * Check backend health & Gemini status
 */
export async function checkHealth() {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error(
      error.response?.data?.message || 'Cannot reach backend server. Please check if backend is running.'
    );
  }
}

/**
 * Send customer message and history to backend voice/chat endpoint
 * @param {string} message
 * @param {Array} history
 * @returns {Promise<{ reply: string, toolUsed: boolean, orderId?: string }>}
 */
export async function sendChatMessage(message, history = []) {
  try {
    const response = await apiClient.post('/voice/chat', {
      message,
      history
    });
    return response.data;
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to get response from AI agent. Please try again.';
    throw new Error(errorMessage);
  }
}

/**
 * Request post-call structured summary from backend
 * @param {Array} transcript
 * @returns {Promise<{ summary: Object }>}
 */
export async function getCallSummary(transcript) {
  try {
    const response = await apiClient.post('/voice/summary', {
      transcript
    });
    return response.data.summary;
  } catch (error) {
    console.error('Summary API error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to generate post-call summary.'
    );
  }
}

/**
 * Fetch authoritative mock orders from backend
 * @returns {Promise<Array>}
 */
export async function getMockOrders() {
  try {
    const response = await apiClient.get('/voice/orders');
    return response.data.orders || [];
  } catch (error) {
    console.warn('Failed to load orders from backend, using fallback:', error);
    return [];
  }
}

export default {
  checkHealth,
  sendChatMessage,
  getCallSummary,
  getMockOrders
};
