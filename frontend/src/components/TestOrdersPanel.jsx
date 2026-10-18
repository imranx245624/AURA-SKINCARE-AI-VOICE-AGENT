import React, { useState } from 'react';
import { Package, Copy, Check, Truck, Clock, AlertCircle } from 'lucide-react';
import './TestOrdersPanel.css';

/**
 * Static representation of assessment mock data for display.
 * Authoritative source remains backend/src/data/mockData.js.
 */
const ASSESSMENT_SAMPLE_ORDERS = [
  {
    order_id: 'ORD-101',
    customer: 'Priya Sharma',
    product: 'Vitamin C Serum (30ml)',
    value: '₹699',
    status: 'Out for Delivery',
    statusType: 'in-transit',
    courier: 'BlueDart',
    tracking_id: 'BD-982103',
    notes: 'BlueDart — BD-982103. Expected by 6 PM today',
    testPrompt: 'Can you tell me where my order ORD-101 is?'
  },
  {
    order_id: 'ORD-102',
    customer: 'Rahul Verma',
    product: 'Hydrating Sunscreen SPF 50',
    value: '₹499',
    status: 'Delivered',
    statusType: 'delivered',
    courier: 'Delhivery',
    tracking_id: 'DL-441029',
    notes: 'Delhivery — DL-441029. Delivered 14 days ago',
    testPrompt: 'Can I return my order ORD-102?'
  },
  {
    order_id: 'ORD-103',
    customer: 'Ananya Patel',
    product: 'Green Tea Face Wash + Toner',
    value: '₹850',
    status: 'Processing',
    statusType: 'processing',
    courier: 'Pending dispatch',
    tracking_id: 'N/A',
    notes: 'Ordered 3 hours ago. Eligible for cancellation',
    testPrompt: 'I want to cancel order ORD-103. Is it possible?'
  }
];

export function TestOrdersPanel({ onSelectPrompt }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="test-orders-panel-card">
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <Package size={18} className="panel-icon" />
          <h3 className="panel-title">Test Orders Helper</h3>
        </div>
        <span className="evaluator-badge">For Evaluators</span>
      </div>

      <p className="panel-desc">
        Click an order ID to copy it, or click <strong>Ask Aria</strong> to test order lookup and policy guardrails instantly:
      </p>

      <div className="orders-grid">
        {ASSESSMENT_SAMPLE_ORDERS.map((order) => (
          <div key={order.order_id} className="order-card">
            <div className="order-card-header">
              <div className="id-badge-group">
                <span className="order-id-tag">{order.order_id}</span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => handleCopy(order.order_id)}
                  title="Copy Order ID"
                  aria-label={`Copy Order ID ${order.order_id}`}
                >
                  {copiedId === order.order_id ? (
                    <Check size={13} className="copy-success" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>

              <span className={`order-status-badge status-${order.statusType}`}>
                {order.status}
              </span>
            </div>

            <div className="order-details-body">
              <div className="detail-line">
                <span className="detail-label">Customer:</span>
                <span className="detail-value">{order.customer}</span>
              </div>
              <div className="detail-line">
                <span className="detail-label">Product:</span>
                <span className="detail-value">{order.product}</span>
              </div>
              <div className="detail-line">
                <span className="detail-label">Value:</span>
                <span className="detail-value value-highlight">{order.value}</span>
              </div>
              <div className="detail-notes-box">
                <Truck size={12} className="notes-icon" />
                <span className="notes-text">{order.notes}</span>
              </div>
            </div>

            {onSelectPrompt && (
              <button
                type="button"
                className="btn-quick-ask"
                onClick={() => onSelectPrompt(order.testPrompt)}
              >
                Ask Aria: "{order.testPrompt}"
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Unknown ID test prompt */}
      <div className="edge-cases-footer">
        <div className="edge-case-item">
          <AlertCircle size={14} className="edge-icon" />
          <span className="edge-text">
            Test invalid ID (e.g., <strong>ORD-999</strong>) to verify graceful handling without hallucinating.
          </span>
          {onSelectPrompt && (
            <button
              type="button"
              className="btn-test-unknown"
              onClick={() => onSelectPrompt('What is the status of my order ORD-999?')}
            >
              Test ORD-999
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestOrdersPanel;
