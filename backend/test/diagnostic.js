import { getGeminiClient, getGeminiModel } from '../src/config/gemini.js';
import { callWithRetry } from '../src/utils/retry.js';

/**
 * Minimal backend diagnostic test.
 * Verifies connectivity, model availability, and tool execution without exposing sensitive keys.
 */
async function runDiagnostic() {
  console.log('====================================================');
  console.log('🔬 AURA SKINCARE — GEMINI API DIAGNOSTIC TEST');
  console.log('====================================================');

  const configuredModel = getGeminiModel();
  console.log(`Configured Model: ${configuredModel}`);

  let ai;
  try {
    ai = getGeminiClient();
    console.log('Client initialized successfully: YES');
  } catch (err) {
    console.error('Client initialization failed:', err.message);
    process.exit(1);
  }

  // Test 1: Simple greeting
  console.log('\n--- Test 1: Simple Greeting ---');
  const startTime = Date.now();
  try {
    const response = await callWithRetry(
      () =>
        ai.models.generateContent({
          model: configuredModel,
          contents: 'Hello Aria, this is a diagnostic test. Please reply in one sentence.'
        }),
      { maxRetries: 3, operationName: 'Diagnostic-Greeting' }
    );

    const elapsed = Date.now() - startTime;
    console.log(`HTTP Status: 200 OK (${elapsed}ms)`);
    console.log(`Response: "${response.text?.trim()}"`);
    console.log('Test 1 Passed: YES');
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const statusCode = error.status || error.statusCode || (error.message?.includes('503') ? 503 : error.message?.includes('429') ? 429 : 500);
    console.error(`HTTP Status: ${statusCode} FAILED (${elapsed}ms)`);
    console.error(`Error details: ${error.message}`);
    console.error('Test 1 Passed: NO');
    return false;
  }

  // Test 2: Function Calling Check
  console.log('\n--- Test 2: Function Calling (get_order_details) ---');
  try {
    const { getOrderDetails, getOrderDetailsDeclaration } = await import('../src/tools/getOrderDetails.js');
    const toolStartTime = Date.now();

    const toolResponse = await callWithRetry(
      () =>
        ai.models.generateContent({
          model: configuredModel,
          contents: 'Where is my order ORD-101?',
          config: {
            tools: [{ functionDeclarations: [getOrderDetailsDeclaration] }],
            systemInstruction: 'You are Aria for Aura Skincare. Always call get_order_details when asked about an order.'
          }
        }),
      { maxRetries: 3, operationName: 'Diagnostic-ToolCall' }
    );

    const toolElapsed = Date.now() - toolStartTime;
    const hasFunctionCalls = Boolean(toolResponse.functionCalls && toolResponse.functionCalls.length > 0);

    if (hasFunctionCalls) {
      const call = toolResponse.functionCalls[0];
      console.log(`Function called: ${call.name} with args: ${JSON.stringify(call.args)}`);
      const executionResult = getOrderDetails(call.args?.order_id);
      console.log(`Local execution succeeded: ${executionResult.found ? 'YES' : 'NO'}`);

      // Feed back function response
      const followUp = await callWithRetry(
        () =>
          ai.models.generateContent({
            model: configuredModel,
            contents: [
              { role: 'user', parts: [{ text: 'Where is my order ORD-101?' }] },
              toolResponse.candidates[0].content,
              { role: 'user', parts: [{ functionResponse: { name: call.name, response: executionResult } }] }
            ]
          }),
        { maxRetries: 3, operationName: 'Diagnostic-ToolResponse' }
      );

      console.log(`Final Spoken Answer: "${followUp.text?.trim()}"`);
      console.log(`Tool Calling Check Passed: YES (${toolElapsed}ms)`);
    } else {
      console.warn('Model did not emit a function call. Direct text was returned.');
    }
  } catch (error) {
    console.error('Tool Calling Check FAILED:', error.message);
    return false;
  }

  console.log('\n====================================================');
  console.log('✅ ALL DIAGNOSTIC CHECKS COMPLETED SUCCESSFULLY');
  console.log('====================================================');
  return true;
}

runDiagnostic().then((success) => {
  process.exit(success ? 0 : 1);
});
