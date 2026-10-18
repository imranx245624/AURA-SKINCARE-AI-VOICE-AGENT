import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Sparkles, Database, MessageSquare } from 'lucide-react';
import './TranscriptPanel.css';

/**
 * TranscriptPanel Component
 * Chronological view of customer and agent dialogue with text fallback input.
 */
export function TranscriptPanel({
  transcript = [],
  onSendMessage,
  callStatus = 'idle',
  isCallActive = false
}) {
  const [typedMessage, setTypedMessage] = useState('');
  const transcriptEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, callStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || callStatus === 'thinking') return;
    onSendMessage(typedMessage);
    setTypedMessage('');
  };

  return (
    <div className="transcript-panel-card">
      <div className="transcript-header">
        <div className="header-title-group">
          <MessageSquare size={18} className="header-icon" />
          <h3 className="header-title">Live Conversation Transcript</h3>
        </div>
        <span className="transcript-counter">
          {transcript.length} {transcript.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Transcript Messages Container */}
      <div className="transcript-body">
        {transcript.length === 0 ? (
          <div className="transcript-empty-state">
            <div className="empty-state-icon-wrapper">
              <Sparkles size={28} className="empty-icon" />
            </div>
            <h4 className="empty-state-title">No conversation yet</h4>
            <p className="empty-state-desc">
              Start the call and speak naturally, or type your query below. Aria can assist with order tracking, shipping rules, returns, and brand policies.
            </p>
            <div className="sample-prompts-grid">
              <span className="sample-prompt-label">Try asking:</span>
              <button
                type="button"
                className="sample-prompt-btn"
                onClick={() => onSendMessage("Can you tell me where my order ORD-101 is?")}
              >
                "Where is my order ORD-101?"
              </button>
              <button
                type="button"
                className="sample-prompt-btn"
                onClick={() => onSendMessage("I bought a cream 20 days ago and opened it. Can I return it?")}
              >
                "Can I return an opened cream bought 20 days ago?"
              </button>
              <button
                type="button"
                className="sample-prompt-btn"
                onClick={() => onSendMessage("What are your shipping charges?")}
              >
                "What are your shipping charges?"
              </button>
            </div>
          </div>
        ) : (
          <div className="transcript-list">
            {transcript.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`message-row ${isUser ? 'user-message-row' : 'agent-message-row'}`}
                >
                  <div className="message-avatar">
                    {isUser ? <User size={15} /> : <span className="aria-initial">A</span>}
                  </div>

                  <div className="message-content-wrapper">
                    <div className="message-meta">
                      <span className="sender-name">{isUser ? 'You (Customer)' : 'Aria'}</span>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>

                    <div className={`message-bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`}>
                      <p className="message-text">{msg.text}</p>
                    </div>

                    {/* Tool Calling Indicator */}
                    {msg.toolUsed && (
                      <div className="tool-usage-badge" title="Gemini backend function call executed">
                        <Database size={12} className="tool-icon" />
                        <span>Backend Tool Called: get_order_details({msg.orderId || 'order_id'})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking indicator bubble */}
            {callStatus === 'thinking' && (
              <div className="message-row agent-message-row thinking-row">
                <div className="message-avatar">
                  <span className="aria-initial">A</span>
                </div>
                <div className="message-content-wrapper">
                  <div className="message-bubble agent-bubble thinking-bubble">
                    <span className="thinking-dot dot-1" />
                    <span className="thinking-dot dot-2" />
                    <span className="thinking-dot dot-3" />
                  </div>
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* Fallback Text Input Form */}
      <div className="transcript-footer">
        <form onSubmit={handleSubmit} className="text-fallback-form">
          <input
            type="text"
            className="text-fallback-input"
            placeholder={
              isCallActive
                ? "Microphone is live (or type a message here)..."
                : "Type a customer message to test Aria..."
            }
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            disabled={callStatus === 'thinking'}
            aria-label="Type message for Aria"
          />
          <button
            type="submit"
            className="text-send-btn"
            disabled={!typedMessage.trim() || callStatus === 'thinking'}
            aria-label="Send Message"
          >
            <Send size={16} />
          </button>
        </form>
        <span className="input-helper-note">
          Text fallback is always available for testing order lookups and policy guardrails.
        </span>
      </div>
    </div>
  );
}

export default TranscriptPanel;
