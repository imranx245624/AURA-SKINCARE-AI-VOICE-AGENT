import express from 'express';
import {
  handleChatMessage,
  handleCallSummary,
  getMockOrders
} from '../controllers/voiceController.js';

const router = express.Router();

router.post('/chat', handleChatMessage);
router.post('/summary', handleCallSummary);
router.get('/orders', getMockOrders);

export default router;
