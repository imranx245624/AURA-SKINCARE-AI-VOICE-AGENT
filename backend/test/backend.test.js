import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrderDetails } from '../src/tools/getOrderDetails.js';
import { validateMessage, validateHistory, validateSummaryRequest } from '../src/utils/validation.js';
import { MOCK_ORDERS } from '../src/data/mockData.js';
import app from '../src/app.js';

test('Mock Data contains exactly 3 required orders', () => {
  assert.equal(MOCK_ORDERS.length, 3);
  const ids = MOCK_ORDERS.map(o => o.order_id);
  assert.deepEqual(ids, ['ORD-101', 'ORD-102', 'ORD-103']);
});

test('getOrderDetails for ORD-101 (Out for Delivery)', () => {
  const result = getOrderDetails('ORD-101');
  assert.equal(result.found, true);
  assert.equal(result.order.customer, 'Priya Sharma');
  assert.equal(result.order.product, 'Vitamin C Serum (30ml)');
  assert.equal(result.order.value, '₹699');
  assert.equal(result.order.status, 'Out for Delivery');
  assert.equal(result.order.courier, 'BlueDart');
  assert.equal(result.order.tracking_id, 'BD-982103');
  assert.equal(result.order.expected_delivery, 'By 6 PM today');
});

test('getOrderDetails for ORD-102 (Delivered 14 days ago)', () => {
  const result = getOrderDetails('ord-102'); // case-insensitive check
  assert.equal(result.found, true);
  assert.equal(result.order.customer, 'Rahul Verma');
  assert.equal(result.order.product, 'Hydrating Sunscreen SPF 50');
  assert.equal(result.order.value, '₹499');
  assert.equal(result.order.status, 'Delivered');
  assert.equal(result.order.timeline, 'Delivered 14 days ago');
});

test('getOrderDetails for ORD-103 (Processing / Cancellable)', () => {
  const result = getOrderDetails('  ORD-103  '); // trimmed check
  assert.equal(result.found, true);
  assert.equal(result.order.customer, 'Ananya Patel');
  assert.equal(result.order.product, 'Green Tea Face Wash + Toner');
  assert.equal(result.order.value, '₹850');
  assert.equal(result.order.status, 'Processing');
  assert.equal(result.order.is_cancellable, true);
});

test('getOrderDetails for invalid or unknown ID', () => {
  const unknown = getOrderDetails('ORD-999');
  assert.equal(unknown.found, false);
  assert.match(unknown.message, /No order found/);

  const empty = getOrderDetails('');
  assert.equal(empty.found, false);

  const nullVal = getOrderDetails(null);
  assert.equal(nullVal.found, false);
});

test('validateMessage validates valid strings and rejects empty / overly long inputs', () => {
  assert.equal(validateMessage('Hello').valid, true);
  assert.equal(validateMessage('   ').valid, false);
  assert.equal(validateMessage(123).valid, false);
  assert.equal(validateMessage('a'.repeat(1001)).valid, false);
});

test('validateHistory normalizes roles and restricts size', () => {
  const rawHistory = [
    { role: 'user', text: 'Hi' },
    { role: 'agent', text: 'Hello, how can I help you?' }
  ];
  const res = validateHistory(rawHistory);
  assert.equal(res.valid, true);
  assert.equal(res.sanitized.length, 2);
  assert.equal(res.sanitized[0].role, 'user');
  assert.equal(res.sanitized[1].role, 'model');
});

test('validateSummaryRequest requires non-empty transcript', () => {
  assert.equal(validateSummaryRequest([]).valid, false);
  assert.equal(validateSummaryRequest(null).valid, false);
  assert.equal(validateSummaryRequest([{ role: 'user', text: 'Where is ORD-101?' }]).valid, true);
});
