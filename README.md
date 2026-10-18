# 🌿 Aura Skincare — AI Voice Customer Support Agent (Aria)

An interactive, browser-based AI Voice Customer Support Agent built for **Aura Skincare**, a premium organic Indian D2C skincare brand. Evaluators can speak naturally with **Aria** using their microphone, receive spoken voice responses in real time, query live mock order data via backend Gemini tool/function calling, test strict brand policies and guardrails, and inspect post-call transcripts and structured summaries.

Built for the **Datastraw Assessment Test — AI Voice Agent**.

---

## 📋 Table of Contents
1. [Overview & Features](#-overview--features)
2. [Live Architecture & Voice Pipeline](#-live-architecture--voice-pipeline)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Assessment Mock Data & Brand Policies](#-assessment-mock-data--brand-policies)
6. [Tool / Function Calling Flow](#-tool--function-calling-flow)
7. [Installation & Local Setup](#-installation--local-setup)
8. [Environment Configuration](#-environment-configuration)
9. [API Endpoint Reference](#-api-endpoint-reference)
10. [Testing Guide for Evaluators](#-testing-guide-for-evaluators)
11. [Section 9: Tell Us How You Think (Assessment Questions)](#-section-9-tell-us-how-you-think)
12. [Deployment Guide](#-deployment-guide)
13. [Submission Checklist](#-submission-checklist)

---

## 🌟 Overview & Features

### A. Natural Voice Interaction
- **Speech-to-Text (STT):** Browser Web Speech Recognition API (`en-IN` Indian English cadence).
- **Text-to-Speech (TTS):** Browser Speech Synthesis API tuned with an Indian English voice profile.
- **Audio Feedback Loop Prevention:** Speech recognition automatically pauses while Aria speaks or thinks, preventing the microphone from picking up the agent's own voice.
- **Graceful Text Fallback:** Full fallback text input on-screen for browsers with restricted microphone access or for testing via text.

### B. Persona & Brand Guardrails
- **Persona:** Aria — friendly, professional, empathetic, and concise Indian customer support specialist.
- **Voice-Optimized Replies:** Concise (1–3 sentences), natural conversational cadence free from distracting markdown formatting or bullet lists.
- **Strict Brand Policy Adherence:** Truthfully enforces shipping thresholds (above vs. below ₹499), 7-day unopened return rules, 48-hour damaged item window, and cancellation limits.
- **Graceful Out-of-Scope Handling:** Politely declines unrelated requests (e.g., *"Can you book me a flight to Goa?"*) while steering back to Aura Skincare support.
- **Prompt Injection Defense:** Ignores attempts to override system instructions or extract internal prompts.

### C. Backend Gemini Function / Tool Calling
- Implements `get_order_details(order_id)` via the official **Google Gen AI JavaScript SDK (`@google/genai`)**.
- Resolves order records from the authoritative in-memory mock database (`ORD-101`, `ORD-102`, `ORD-103`).
- Handles unknown orders (e.g., `ORD-999`) and missing order IDs without hallucinations.

### D. Post-Call Transcript & Structured Outcome
- Real-time chronological chat transcript distinguishing customer and agent messages.
- Automatic structured summary generation upon ending a call (`customer_intent`, `order_id`, `resolution_status`, `call_summary`) with interactive visual card and raw JSON toggle.

### E. Evaluator-First Test Orders Helper
- On-page reference card displaying all three mock orders from the assessment with status pills and quick copy buttons.
- One-click prompt buttons (e.g. *"Where is my order ORD-101?"*) to test voice & tool calling immediately.

---

## 📐 Live Architecture & Voice Pipeline

```
[ User speaks into Microphone ]
             │
             ▼
[ Browser Web Speech API ]
      (SpeechRecognition: en-IN)
             │  (Final transcript)
             ▼
[ React Frontend State ] ──▶ (Append message, set status to 'thinking', pause recognition)
             │
             ▼ (POST /api/voice/chat: { message, history })
[ Express.js Backend ]
             │
             ▼
[ Google Gen AI SDK (@google/genai) ]
             │
     ┌───────┴────────────────────────┐
     │ Model requests function call?  │
     └───────┬────────────────────────┘
             ├──▶ YES: Execute get_order_details(order_id) locally
             │         Send functionResponse back to Gemini
             │         Generate final natural spoken answer
             │
             └──▶ NO:  Generate natural policy / conversational answer
             │
             ▼
[ Express Response: { reply, toolUsed, orderId } ]
             │
             ▼
[ React Frontend State ] ──▶ (Append Aria reply, set status to 'speaking')
             │
             ▼
[ Browser SpeechSynthesis API ] ──▶ [ User hears Aria through speakers ]
             │
             ▼ (Speech ends)
[ Resume Web SpeechRecognition ] ──▶ (Set status to 'listening' if call active)
```

---

## 🛠️ Technology Stack

| Layer | Technologies | Justification |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, JavaScript (ESM) | Ultra-fast HMR, lightweight bundle (231 KB JS, 26 KB CSS), component architecture. |
| **Styling** | Vanilla Modular CSS + CSS Custom Properties | No heavy CSS frameworks; bespoke organic aesthetic with component-level isolation. |
| **Icons** | Lucide React | Minimal, crisp SVG iconography. |
| **Backend** | Node.js (v18+), Express 4 | Stateless, request-scoped architecture, clean REST endpoints, zero ORM overhead. |
| **AI / LLM** | Google Gen AI SDK (`@google/genai` v2.30.0) | Official current SDK with native Gemini function calling and structured JSON output. |
| **Model** | `gemini-2.5-flash` (or `gemini-1.5-flash`) | Low latency, highly cost-effective, excellent tool calling accuracy. |
| **Voice Engine** | Browser Web Speech API (SpeechRecognition + SpeechSynthesis) | Zero third-party audio streaming costs, zero telephony setup, instant browser evaluation. |

---

## 📁 Project Structure

```
aura-skincare-voice-agent/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── gemini.js            # Official @google/genai client initialization
│   │   ├── data/
│   │   │   ├── mockData.js          # Authoritative mock database (ORD-101, 102, 103)
│   │   │   └── policies.js          # Brand guidelines & policy rules
│   │   ├── tools/
│   │   │   └── getOrderDetails.js   # get_order_details function & tool declaration
│   │   ├── services/
│   │   │   ├── geminiService.js     # System prompt, tool-calling execution loop
│   │   │   └── summaryService.js    # Structured post-call summary generator
│   │   ├── controllers/
│   │   │   └── voiceController.js   # Chat, summary, health, and orders controllers
│   │   ├── routes/
│   │   │   └── voiceRoutes.js       # /chat, /summary, /orders route handlers
│   │   ├── middleware/
│   │   │   └── errorHandler.js      # Centralized error handler & status mapping
│   │   ├── utils/
│   │   │   └── validation.js        # Input sanitization and payload validation
│   │   ├── app.js                   # Express configuration, CORS, JSON parsing
│   │   └── server.js                # Server entry point & startup diagnostics
│   ├── test/
│   │   └── backend.test.js          # 8 automated unit tests for tools & validation
│   ├── .env.example                 # Backend environment variable template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg              # Botanical drop icon
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.svg             # Aura Skincare brand emblem
│   │   ├── components/
│   │   │   ├── CallControls.jsx & .css    # Start/End Call, duration timer, mute
│   │   │   ├── AgentStatus.jsx & .css     # Aria avatar, live orb, waveforms, badges
│   │   │   ├── TranscriptPanel.jsx & .css # Chronological chat, tool tags, fallback
│   │   │   ├── TestOrdersPanel.jsx & .css # Mock orders helper, copy ID, test buttons
│   │   │   └── CallSummary.jsx & .css     # Post-call outcome, JSON toggle view
│   │   ├── hooks/
│   │   │   └── useVoiceAgent.js           # Speech recognition & synthesis lifecycle
│   │   ├── services/
│   │   │   └── api.js                     # Centralized Axios HTTP client
│   │   ├── styles/
│   │   │   └── global.css                 # Color tokens, typography, resets
│   │   ├── App.jsx & App.css              # Main layout, policy drawer, error banner
│   │   └── main.jsx                       # React DOM entry point
│   ├── .env.example                 # Frontend environment variable template
│   ├── index.html                   # HTML template with Google Fonts
│   ├── package.json
│   └── vite.config.js               # Vite config with API proxy
│
├── .gitignore
├── package.json                     # Root runner convenience scripts
└── README.md
```

---

## 📦 Assessment Mock Data & Brand Policies

### 1. Authoritative Mock Orders (`backend/src/data/mockData.js`)

| Order ID | Customer | Product | Value | Status | Courier / Tracking | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ORD-101** | Priya Sharma | Vitamin C Serum (30ml) | ₹699 | Out for Delivery | BlueDart (BD-982103) | Expected by 6 PM today. |
| **ORD-102** | Rahul Verma | Hydrating Sunscreen SPF 50 | ₹499 | Delivered | Delhivery (DL-441029) | Delivered 14 days ago. |
| **ORD-103** | Ananya Patel | Green Tea Face Wash + Toner | ₹850 | Processing | None (Pending) | Ordered 3 hours ago. Eligible for cancellation. |

### 2. Brand Policies (`backend/src/data/policies.js`)
- **Brand Overview:** Aura Skincare is a premium organic Indian skincare brand focused on simple, effective skincare made with thoughtfully selected ingredients.
- **Shipping Policy:**
  - Free delivery on orders **above ₹499**.
  - Orders **below ₹499** incur a **₹50 shipping fee**.
  - Standard delivery takes **3–5 business days**.
  - Boundary: The policy explicitly distinguishes *above* and *below* ₹499; Aria communicates this accurately without inventing arbitrary rules.
- **Return & Refund Policy:**
  - Returns accepted within **7 days of delivery** for **unopened, unused** products in original packaging.
  - Opened or used products cannot be returned.
  - Items delivered > 7 days ago (e.g. Rahul Verma's ORD-102 delivered 14 days ago) are **ineligible**.
  - Damaged or defective items must be reported within **48 hours of delivery with photos** for replacement.
- **Cancellation Policy:**
  - Orders can be cancelled **only while their status is Processing** (e.g. ORD-103).
  - Once an order is *Shipped* or *Out for Delivery* (e.g. ORD-101), it cannot be cancelled (customers may refuse delivery at doorstep).
  - Aria explains eligibility clearly and honestly, noting that she cannot unilaterally execute database cancellations.
- **Cash on Delivery (COD):**
  - Available for orders up to **₹2,500**.
  - Payable via **cash or UPI** at the doorstep.

---

## ⚡ Tool / Function Calling Flow

Aria uses real backend tool calling with Gemini:

1. **Tool Declaration:**
   ```javascript
   export const getOrderDetailsDeclaration = {
     name: 'get_order_details',
     description: 'Lookup live details for an Aura Skincare order using its unique order ID (e.g. ORD-101, ORD-102, ORD-103).',
     parameters: {
       type: 'OBJECT',
       properties: {
         order_id: { type: 'STRING', description: 'The unique order identifier' }
       },
       required: ['order_id']
     }
   };
   ```

2. **Triggering:** When a customer asks: *"Where is my order ORD-101?"*, Gemini inspects the available tools and emits a `functionCall`:
   ```json
   {
     "name": "get_order_details",
     "args": { "order_id": "ORD-101" }
   }
   ```

3. **Execution & Feedback:**
   - The backend validates the name and parameters, normalizes the ID, and queries `MOCK_ORDERS`.
   - The backend packages the result as a `functionResponse`:
     ```json
     {
       "functionResponse": {
         "name": "get_order_details",
         "response": {
           "found": true,
           "order": {
             "order_id": "ORD-101",
             "status": "Out for Delivery",
             "courier": "BlueDart",
             "tracking_id": "BD-982103",
             "expected_delivery": "By 6 PM today"
           }
         }
       }
     }
     ```
   - Gemini receives this response and generates the final customer-facing reply:
     > *"Your order ORD-101 for the Vitamin C Serum is out for delivery with BlueDart and is expected to arrive by 6 PM today."*

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended, tested on Node v22)
- **npm** (v9+ or v10+)
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Enter Project
```bash
git clone <your-repository-url>
cd aura-skincare-voice-agent
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` and insert your Gemini API Key:
```env
PORT=5000
GEMINI_API_KEY=AIzaSy...your_actual_key_here
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
```

Run backend automated tests:
```bash
npm test
```
*(Runs 8 automated unit tests verifying order lookups, validation, and boundary conditions).*

Start the backend:
```bash
npm run dev
# Server runs at http://localhost:5000
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
cp .env.example .env
```
Start the frontend development server:
```bash
npm run dev
# Application opens at http://localhost:5173
```

---

## 🔒 Environment Configuration

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5000` |
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 🌐 API Endpoint Reference

### 1. Health Check
- **`GET /api/health`**
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "aura-skincare-voice-agent",
    "timestamp": "2026-10-15T18:24:44.793Z",
    "geminiConfigured": true
  }
  ```

### 2. Voice Chat Message
- **`POST /api/voice/chat`**
- **Request Body:**
  ```json
  {
    "message": "Can you check the delivery status of ORD-101?",
    "history": [
      { "role": "user", "text": "Hi" },
      { "role": "model", "text": "Hello! Welcome to Aura Skincare. How can I assist you today?" }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Your order ORD-101 containing Vitamin C Serum is out for delivery with BlueDart and is expected by 6 PM today.",
    "toolUsed": true,
    "orderId": "ORD-101"
  }
  ```

### 3. Post-Call Summary
- **`POST /api/voice/summary`**
- **Request Body:**
  ```json
  {
    "transcript": [
      { "role": "user", "text": "Can you tell me where my order ORD-101 is?" },
      { "role": "agent", "text": "Your order ORD-101 is out for delivery with BlueDart and expected by 6 PM today." }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "summary": {
      "customer_intent": "ORDER_TRACKING",
      "order_id": "ORD-101",
      "resolution_status": "RESOLVED",
      "call_summary": "Customer inquired about the delivery status of order ORD-101. Aria verified that the order is out for delivery via BlueDart and expected by 6 PM today."
    }
  }
  ```

### 4. Mock Orders List
- **`GET /api/voice/orders`**
- **Response:** Returns the array of authoritative mock orders.

---

## 🧪 Testing Guide for Evaluators

Evaluators can test the core scenarios via voice (by clicking **Start Call**) or by typing in the fallback input box:

| Test Scenario | Sample Prompt | Expected Behavior |
| :--- | :--- | :--- |
| **Order Lookup (In-Transit)** | *"Where is my order ORD-101?"* | Calls `get_order_details('ORD-101')`. Reports Vitamin C Serum is Out for Delivery via BlueDart (BD-982103), arriving by 6 PM today. |
| **Order Lookup (Delivered)** | *"Can you check order ORD-102?"* | Calls `get_order_details('ORD-102')`. Reports Hydrating Sunscreen delivered 14 days ago via Delhivery. |
| **Return Policy Enforcement** | *"I bought order ORD-102 14 days ago and opened it. Can I return it?"* | Explains politely that returns must be requested within 7 days and items must be unopened/unused; therefore, ORD-102 is ineligible for return. |
| **Order Cancellation (Allowed)** | *"Can I cancel order ORD-103?"* | Calls `get_order_details('ORD-103')`. Confirms status is Processing, making it eligible for cancellation under brand policy. |
| **Order Cancellation (Refusal)** | *"Can I cancel order ORD-101?"* | Explains that ORD-101 is already Out for Delivery and cannot be cancelled, but the customer may refuse delivery at the doorstep. |
| **Unknown Order ID** | *"What is the status of order ORD-999?"* | Tool returns not found. Aria politely informs the customer that no order was found with ID ORD-999 and asks to double check the number. |
| **Missing Order ID** | *"Where is my package?"* | Aria asks the customer to provide their specific order ID. |
| **Shipping Policy** | *"What are your delivery charges?"* | States free delivery on orders above ₹499; ₹50 fee on orders below ₹499; 3–5 business days standard delivery. |
| **Out-of-Scope Guardrail** | *"Can you book me a flight to Goa?"* | Politely explains she is Aura Skincare's assistant and can only help with skincare products, orders, and policies. |
| **Post-Call Summary** | Click **End Call** | Generates structured JSON outcome with `customer_intent`, `order_id`, `resolution_status`, and `call_summary`. |

---

## 💡 Section 9: Tell Us How You Think

### 1. Why did you choose your particular architecture and technology stack?
I chose a decoupled **Modular Architecture** with a lightweight **Node.js/Express backend** and a **React + Vite single-page frontend**:
- **Separation of Concerns & Security:** Calling the Gemini API directly from the client exposes API keys and invites prompt tampering. Routing requests through an Express backend keeps credentials server-side, enables strict server-side validation of conversation history, and controls tool execution.
- **Official Google Gen AI SDK (`@google/genai`):** Rather than hand-rolling raw HTTP fetch wrappers or relying on deprecated SDKs, the official SDK provides type-safe function declarations, structured JSON schema enforcement (`responseMimeType: 'application/json'`), and native multi-turn conversation handling.
- **Zero-Latency Browser Web Speech API:** For voice STT and TTS, using the browser's native `SpeechRecognition` and `SpeechSynthesis` provides instantaneous turnaround without incurring third-party audio streaming costs (like ElevenLabs or Deepgram) or requiring telephony setup.
- **Request-Scoped Statelessness:** Keeping active conversation in React state and sending validated context per request eliminates the synchronization bugs, concurrency collisions, and storage overhead of server-side sessions or databases.

### 2. What was the most difficult part of the assignment, and how did you solve it?
The most delicate challenge was **preventing audio feedback loops** while maintaining natural conversational turn-taking:
- **The Problem:** In browser environments without specialized hardware echo-cancellation, when the agent speaks through the device speakers, the microphone often transcribes the agent's own speech, triggering an infinite feedback loop of self-responses.
- **The Solution:**
  1. Implemented strict state orchestration inside `useVoiceAgent.js`. Before Aria begins speaking or thinking, the speech recognition instance is explicitly aborted and decoupled.
  2. The `speakResponse()` promise hooks into `SpeechSynthesisUtterance.onend`. Only after speech playback concludes does the hook reactivate `SpeechRecognition.start()` with a 200ms debounce.
  3. Added an explicit `isCallActiveRef` check to ensure asynchronous speech callbacks never accidentally restart listening after the user clicks "End Call".

### 3. If you had one more week to work on this, what would you improve first and why?
1. **Real-time Bidirectional WebSocket Streaming (Gemini Live API):**
   - Transition from request-response HTTP to the Gemini Live API over WebSockets.
   - Stream raw PCM audio directly from the microphone to the model and stream audio chunks back for instantaneous latency (< 500ms).
2. **True Barge-in / Audio Interruption Detection:**
   - Incorporate a client-side Voice Activity Detection (VAD) audio worklet. When the user speaks while Aria is speaking, the worklet immediately interrupts TTS and flushes the buffer.
3. **Conversational Hinglish & Regional Language Support:**
   - Add automated language detection and code-switching to support common Indian shopping phrasing (e.g., *"Mera parcel kab deliver hoga?"*, *"COD pe UPI chalega kya?"*).
4. **Interactive Action Tools:**
   - Extend function calling to include `request_order_cancellation(order_id)` and `submit_replacement_ticket(order_id, photo_count)` with confirmation guardrails.

### 4. Imagine this agent is handling 1,000 customer conversations a day. What do you think would need to change or improve?
1. **Infrastructure & Concurrency:**
   - Deploy backend instances behind a load balancer (e.g., Google Cloud Run or AWS ECS) with horizontal autoscaling to handle peak call volumes without CPU starvation.
2. **Rate Limiting & Cost Optimization:**
   - Implement Redis-based token bucket rate limiting per IP / session to protect against spam attacks.
   - Cache frequent deterministic queries (e.g. shipping policy FAQs) in a Redis or Cloudflare edge cache to reduce unnecessary LLM inference tokens.
3. **Database Integration & Authentication:**
   - Connect the order lookup tool to a real production database (PostgreSQL / DynamoDB) with read replicas and parameterized SQL queries.
   - Implement OTP/SMS customer phone verification before revealing sensitive customer names and delivery addresses.
4. **Observability, Tracing & Guardrail Monitoring:**
   - Integrate OpenTelemetry and LLM observability platforms (such as Langfuse or Arize Phoenix) to monitor latency, tool call accuracy, fallback frequencies, and policy compliance across all 1,000 daily sessions.
5. **Human Escalation Fallback:**
   - Integrate a webhook to seamlessly transfer complex or escalated disputes (e.g., damaged deliveries or angry customers) to live Zendesk or Freshdesk support agents with the complete transcript attached.

---

## 🚢 Deployment Guide

### Deploying Frontend (Vercel / Netlify)
1. Push your repository to GitHub.
2. Connect your repository on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
3. Set **Root Directory** to `frontend`.
4. Configure Build Command: `npm run build`, Output Directory: `dist`.
5. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com/api`
6. Click **Deploy**.

### Deploying Backend (Render / Railway / Fly.io)
1. Connect your repository on [Render](https://render.com/) as a **Web Service**.
2. Set **Root Directory** to `backend`.
3. Set Build Command: `npm install`.
4. Set Start Command: `npm start`.
5. Configure Environment Variables in Render Dashboard:
   - `PORT`: `5000`
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `FRONTEND_URL`: `https://your-frontend-app.vercel.app`
6. Click **Deploy**. Once deployed, verify `https://your-backend-app.onrender.com/api/health`.

---

## ✅ Submission Checklist

- [x] Working Browser-based AI Voice Agent for Aura Skincare (Aria)
- [x] Natural voice conversation with browser STT and TTS
- [x] Real backend Gemini function/tool calling (`get_order_details`)
- [x] Authoritative mock order data (`ORD-101`, `ORD-102`, `ORD-103`)
- [x] Strict brand policy enforcement (shipping, returns, cancellations, COD)
- [x] Graceful degradation (unknown order IDs, missing IDs, out-of-scope queries)
- [x] Live agent state indicators (Listening, Thinking, Speaking, Idle, Error)
- [x] Evaluator Test Orders Helper card with one-click copy and quick test prompts
- [x] Real-time chronological transcript
- [x] Post-call structured JSON outcome (`customer_intent`, `order_id`, `resolution_status`, `call_summary`)
- [x] Text input fallback
- [x] 8 automated backend unit tests passing
- [x] Frontend production build passing (`vite build`)
- [x] Section 9 answers documented in full in README.md
- [x] `.env.example` templates created for both frontend and backend
- [x] Clean `.gitignore` excluding secrets and dependencies

---

*Crafted for the Datastraw Assessment Test.*
