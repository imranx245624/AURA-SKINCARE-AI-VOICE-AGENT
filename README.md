Aura Skincare AI Voice Agent
Aria is a voice-based customer support agent made for the Aura Skincare assessment. Users can ask about their orders and skincare store policies by speaking or typing.

Live app: https://ariaaiagent.vercel.app/
GitHub: https://github.com/imranx245624/AURA-SKINCARE-AI-VOICE-AGENT
Features
- Speech-to-text and text-to-speech in the browser.
- Ask questions about order status using mock order data.
- Answer questions about delivery, returns, cancellations, and COD.
- Gemini function calling for order lookup.
- Show the conversation transcript and a summary after the call.
- Text input is available if microphone access does not work.
- Basic input checks and error handling on the backend.
Tech Stack
- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express
- AI: Google Gemini API using @google/genai
- Voice: Browser Web Speech API
- HTTP requests: Axios
- Testing: Node.js test runner
How it works
1. The browser converts the user's speech into text.
2. The React app sends the message and conversation history to the backend using Axios.
3. Express receives the request and passes it to the Gemini service.
4. If order information is needed, Gemini asks the backend to run get_order_details.
5. The function looks for the order in backend/src/data/mockData.js. Policy information is kept in backend/src/data/policies.js.
6. Gemini creates a reply and the backend sends it to the frontend.
7. The browser reads the reply aloud and adds it to the transcript.
8. When the call ends, the app requests a summary of the conversation.
This project uses sample order data. It is not connected to a real store or delivery service.
Project Structure
backend/
  src/
    config/gemini.js
    data/mockData.js
    data/policies.js
    tools/getOrderDetails.js
    services/geminiService.js
    services/summaryService.js
    controllers/voiceController.js
    routes/voiceRoutes.js
    middleware/errorHandler.js
    utils/validation.js
    app.js
    server.js
  test/backend.test.js
  .env.example

frontend/
  src/
    components/
    hooks/useVoiceAgent.js
    services/api.js
    styles/global.css
    App.jsx
  .env.example
  package.json

package.json
README.md
Sample Orders
Order ID	Product	Status	Details
ORD-101	Vitamin C Serum 30ml	Out for delivery	BlueDart tracking: BD-982103; expected by 6 PM today
ORD-102	Hydrating Sunscreen SPF 50	Delivered	Delhivery tracking: DL-441029; delivered 14 days ago
ORD-103	Green Tea Face Wash + Toner	Processing	Ordered 3 hours ago; eligible for cancellation under the sample policy


These are only test records.
Store Policies Used in the Demo
- Delivery usually takes 3–5 business days.
- Orders above ₹499 have free delivery; orders below ₹499 have a ₹50 delivery fee.
- Returns are accepted within 7 days of delivery if the product is unopened, unused, and in its original packaging.
- Damaged or defective products must be reported within 48 hours with photos.
- An order can be cancelled only while its status is Processing.
- COD is available for orders up to ₹2,500 and can be paid by cash or UPI.
- Aria should not claim that a cancellation or refund has been completed because this demo does not perform those actions.
Run the Project Locally
Requirements
- Node.js 18 or newer
- npm
- A Gemini API key from Google AI Studio
1. Backend
cd backend
npm install
Copy .env.example to .env and set your values:
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
Start the backend:
npm run dev
The backend runs at http://localhost:5000.
2. Frontend
Open a second terminal:
cd frontend
npm install
Copy the frontend .env.example to .env and set:
VITE_API_BASE_URL=http://localhost:5000/api
Start the frontend:
npm run dev
Vite will show the local URL, usually http://localhost:5173.

Do not commit real API keys. Keep them in .env files and make sure those files are ignored by Git.
API Endpoints
GET /api/health
Checks whether the backend is running.
POST /api/voice/chat
Sends a message and conversation history.

Example request:
{
  "message": "Where is my order ORD-101?",
  "history": []
}
The response includes the agent's reply, whether a tool was used (toolUsed), and the detected orderId when available.
POST /api/voice/summary
Sends the conversation transcript and returns a summary with:
- customer_intent
- order_id
- resolution_status
- call_summary
GET /api/voice/orders
Returns the sample orders used by the demo.
Try These Questions
- “Where is my order ORD-101?”
- “Can you check order ORD-102?”
- “Can I cancel order ORD-103?”
- “Can I return an opened product after 20 days?”
- “What are your delivery charges?”
- “Can you book me a flight to Goa?” — Aria should explain that she only helps with Aura Skincare support.
After testing, end the call to see the transcript summary.
Assessment Questions
1. Why did you choose this architecture and technology stack?
I used React for the interface and Node.js with Express for the backend. This keeps the frontend and backend separate and makes the code easier to manage. The Gemini API key stays on the backend instead of being exposed in the browser. I used the browser's speech APIs so the demo can support voice input and output without adding a separate voice service.
2. What was the most difficult part, and how did you solve it?
One difficult part was stopping the microphone from picking up Aria's own voice. I handled this in useVoiceAgent.js by pausing speech recognition while Aria is thinking or speaking, then starting it again after the response finishes. The call-active check also helps prevent listening from restarting after the user ends the call.
3. What would you improve with one more week?
I would improve the voice experience first, especially response speed and the ability to interrupt the agent while it is speaking. I would also add Hinglish support and connect the order lookup to a real database. Any cancellation or replacement action would need clear user confirmation.
4. What would need to change for 1,000 conversations a day?
I would move the sample data to a real database, add authentication and customer verification, and deploy the backend so it can scale when traffic increases. I would also add rate limiting, logging, monitoring, and a way to transfer difficult cases to a human support agent.
Deployment Notes
- Frontend: Deploy the frontend folder on Vercel or Netlify. Set VITE_API_BASE_URL to the deployed backend API URL.
- Backend: Deploy the backend folder on a Node.js hosting service. Set PORT, GEMINI_API_KEY, GEMINI_MODEL, and FRONTEND_URL in the hosting environment.
- Check /api/health after deployment to confirm the backend is responding.
Notes
- Order details are mock data and can reset when the server restarts.
- The project does not connect to a real payment, shipping, or order management system.
- Browser speech recognition support can vary by browser and device.
- Keep .env files and API keys private.