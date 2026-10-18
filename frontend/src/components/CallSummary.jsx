import React, { useState } from 'react';
import { FileText, CheckCircle2, Copy, Check, Code, HelpCircle } from 'lucide-react';
import './CallSummary.css';

/**
 * CallSummary Component
 * Renders the structured post-call summary and JSON outcome.
 */
export function CallSummary({ summary, isGenerating = false }) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isGenerating) {
    return (
      <div className="call-summary-card summary-loading">
        <div className="summary-spinner" />
        <p className="summary-loading-text">Generating structured post-call summary with Gemini...</p>
      </div>
    );
  }

  if (!summary) return null;

  const jsonString = JSON.stringify(summary, null, 2);

  const handleCopy = () => {
    navigator.clipboard?.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return 'badge-resolved';
      case 'INFO_PROVIDED':
        return 'badge-info';
      case 'INELIGIBLE_REQUEST':
        return 'badge-ineligible';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="call-summary-card">
      <div className="summary-header">
        <div className="summary-title-wrapper">
          <FileText size={18} className="summary-icon" />
          <h3 className="summary-title">Post-Call Outcome & Summary</h3>
        </div>

        <div className="summary-actions">
          <button
            type="button"
            className={`btn-toggle-view ${showJson ? 'active' : ''}`}
            onClick={() => setShowJson(!showJson)}
          >
            <Code size={14} />
            <span>{showJson ? 'Show Visual' : 'View JSON'}</span>
          </button>

          <button
            type="button"
            className="btn-copy-json"
            onClick={handleCopy}
            title="Copy JSON Outcome"
          >
            {copied ? <Check size={14} className="copy-ok" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {showJson ? (
        <pre className="summary-json-box">
          <code>{jsonString}</code>
        </pre>
      ) : (
        <div className="summary-content">
          <div className="summary-grid">
            {/* Customer Intent */}
            <div className="summary-item">
              <span className="summary-label">Customer Intent</span>
              <span className="summary-value intent-tag">
                {summary.customer_intent || 'GENERAL_INQUIRY'}
              </span>
            </div>

            {/* Order ID */}
            <div className="summary-item">
              <span className="summary-label">Order ID</span>
              <span className="summary-value order-id-tag">
                {summary.order_id || 'None / Not Mentioned'}
              </span>
            </div>

            {/* Resolution Status */}
            <div className="summary-item">
              <span className="summary-label">Resolution Status</span>
              <span className={`summary-status-pill ${getStatusBadgeClass(summary.resolution_status)}`}>
                <CheckCircle2 size={13} />
                <span>{summary.resolution_status || 'INFO_PROVIDED'}</span>
              </span>
            </div>
          </div>

          {/* Call Summary Text */}
          <div className="summary-text-container">
            <span className="summary-label">Call Summary</span>
            <p className="summary-text-desc">{summary.call_summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallSummary;
