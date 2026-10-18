import React, { useEffect, useState } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent.js';
import { checkHealth } from './services/api.js';
import CallControls from './components/CallControls.jsx';
import AgentStatus from './components/AgentStatus.jsx';
import TranscriptPanel from './components/TranscriptPanel.jsx';
import TestOrdersPanel from './components/TestOrdersPanel.jsx';
import CallSummary from './components/CallSummary.jsx';
import { Sparkles, ShieldCheck, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './App.css';

export function App() {
  const {
    callStatus,
    isCallActive,
    transcript,
    summary,
    isGeneratingSummary,
    error,
    isMuted,
    callDuration,
    speechSupported,
    startCall,
    endCall,
    toggleMute,
    sendMessage,
    clearError
  } = useVoiceAgent();

  const [backendStatus, setBackendStatus] = useState({
    checking: true,
    online: false,
    geminiConfigured: false,
    message: ''
  });

  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Check backend health on initial load
  const verifyBackend = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    try {
      const data = await checkHealth();
      setBackendStatus({
        checking: false,
        online: true,
        geminiConfigured: data.geminiConfigured,
        message: data.geminiConfigured ? 'Ready' : 'API Key Pending in .env'
      });
    } catch (err) {
      setBackendStatus({
        checking: false,
        online: false,
        geminiConfigured: false,
        message: err.message
      });
    }
  };

  useEffect(() => {
    verifyBackend();
  }, []);

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-lockup">
            <div className="brand-logo-emblem">
              <span className="logo-initial">A</span>
            </div>
            <div className="brand-text-group">
              <h1 className="brand-title">AURA SKINCARE</h1>
              <span className="brand-subtitle">ORGANIC BOTANICAL BEAUTY</span>
            </div>
          </div>

          <div className="header-meta">
            {/* System Status Pill */}
            <div
              className={`server-status-pill ${backendStatus.online ? 'status-online' : 'status-offline'
                }`}
              title="Backend API Connectivity"
            >
              <span className="status-indicator-dot" />
              <span className="status-pill-text">
                {backendStatus.checking
                  ? 'Connecting...'
                  : backendStatus.online
                    ? backendStatus.geminiConfigured
                      ? 'AI Agent Live'
                      : 'Backend Online (Add Gemini Key)'
                    : 'Backend Offline'}
              </span>
              {!backendStatus.online && (
                <button
                  type="button"
                  className="btn-retry-health"
                  onClick={verifyBackend}
                  title="Retry connection"
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>

            {/* Policy Reference Toggle */}
            <button
              type="button"
              className="btn-policy-guide"
              onClick={() => setShowPolicyModal(!showPolicyModal)}
              aria-label="View Aura Brand Policies"
            >
              <ShieldCheck size={16} />
              <span>Brand Policies</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="app-error-banner" role="alert">
          <div className="error-banner-content">
            <AlertCircle size={18} className="error-icon" />
            <span className="error-message">{error}</span>
          </div>
          <button type="button" className="btn-dismiss-error" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {/* Brand Policies Quick Reference Drawer / Modal */}
      {showPolicyModal && (
        <div className="policy-modal-overlay" onClick={() => setShowPolicyModal(false)}>
          <div className="policy-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <ShieldCheck size={20} className="modal-icon" />
                <h3 className="modal-title">Aura Skincare Policy Reference</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowPolicyModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="policy-item">
                <h4 className="policy-heading">🚚 Shipping Policy</h4>
                <p>Free delivery on orders above ₹499. Orders below ₹499 have a ₹50 shipping fee. Standard delivery takes 3–5 business days.</p>
              </div>

              <div className="policy-item">
                <h4 className="policy-heading">🔄 Return & Refund Policy</h4>
                <p>Returns accepted within 7 days of delivery for unopened, unused products in original packaging. Opened products or products purchased &gt; 7 days ago (e.g. 14 or 20 days) are not eligible. Damaged/defective items must be reported within 48 hours with photos for replacement.</p>
              </div>

              <div className="policy-item">
                <h4 className="policy-heading">❌ Cancellation Policy</h4>
                <p>Orders can be cancelled only while their status is <em>Processing</em>. Once Shipped or Out for Delivery, orders cannot be cancelled (customers may refuse delivery at doorstep).</p>
              </div>

              <div className="policy-item">
                <h4 className="policy-heading">💵 Cash on Delivery (COD)</h4>
                <p>COD is available for orders up to ₹2,500. Customers can pay by cash or UPI at the doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Experience Layout */}
      <main className="app-main-content">
        <div className="content-container">
          {/* Hero Banner with Aria's persona intro */}
          <section className="agent-intro-banner">
            <div className="intro-badge">
              <Sparkles size={14} />
              <span>Voice CX Support Experience</span>
            </div>
            <h2 className="intro-title">Speak with Aria, Aura's AI Skincare Assistant</h2>
            <p className="intro-subtitle">
              Ask about live order tracking, shipping rates, product returns, or skincare advice.
              Aria will answer using official Aura Skincare policies and live tool calls.
            </p>
          </section>

          {/* Core Interactive Grid */}
          <div className="main-interactive-grid">
            {/* Left Column: Status, Controls, Test Orders Helper */}
            <div className="left-panel-column">
              <AgentStatus status={callStatus} error={error} />

              <CallControls
                isCallActive={isCallActive}
                callStatus={callStatus}
                onStartCall={startCall}
                onEndCall={endCall}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                callDuration={callDuration}
                speechSupported={speechSupported}
              />

              {/* <TestOrdersPanel onSelectPrompt={sendMessage} /> */}
            </div>

            {/* Right Column: Live Transcript and Post-Call Summary */}
            <div className="right-panel-column">
              <TranscriptPanel
                transcript={transcript}
                onSendMessage={sendMessage}
                callStatus={callStatus}
                isCallActive={isCallActive}
              />

              {/* Post-Call Summary Card (displays when call ends or has summary) */}
              <CallSummary summary={summary} isGenerating={isGeneratingSummary} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <span className="footer-brand">Aura Skincare AI Voice Agent</span>
            {/* <span className="footer-divider">•</span> */}
            {/* <span className="footer-note">Datastraw Assessment Implementation</span> */}
          </div>

          {/* <div className="footer-tech-stack">
            <span className="tech-badge">React + Vite</span>
            <span className="tech-badge">Node.js + Express</span>
            <span className="tech-badge">Google Gen AI SDK</span>
            <span className="tech-badge">Web Speech API</span>
          </div> */}
        </div>
      </footer>
    </div>
  );
}

export default App;
