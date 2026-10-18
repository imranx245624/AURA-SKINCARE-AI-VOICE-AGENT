import app from './app.js';
import { isGeminiConfigured, getGeminiModel } from './config/gemini.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🌿 Aura Skincare Voice Agent Backend running on port ${PORT}`);
  console.log(`🚀 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini Model: ${getGeminiModel()}`);
  console.log(`🔑 Gemini Configured: ${isGeminiConfigured() ? 'Yes (Active)' : 'No (Pending API Key in .env)'}`);
  console.log('========================================================');
});
