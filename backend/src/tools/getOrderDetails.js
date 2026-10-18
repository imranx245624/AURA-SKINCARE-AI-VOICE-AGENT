import { MOCK_ORDERS } from '../data/mockData.js';

/**
 * Tool: get_order_details
 * Retrieves live order information for a given order ID from the mock database.
 *
 * @param {string} orderId - The unique order ID (e.g., 'ORD-101')
 * @returns {Object} Safe structured order details or not found status
 */
export function getOrderDetails(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    return {
      found: false,
      message: 'A valid order ID string is required (e.g., ORD-101, ORD-102, ORD-103).'
    };
  }

  // Normalize input: trim and uppercase
  const normalizedId = orderId.trim().toUpperCase();

  const match = MOCK_ORDERS.find(
    (order) => order.order_id.toUpperCase() === normalizedId
  );

  if (!match) {
    return {
      found: false,
      order_id: normalizedId,
      message: `No order found with ID ${normalizedId}. Please verify the order ID.`
    };
  }

  // Return only the matching order details
  return {
    found: true,
    order: {
      order_id: match.order_id,
      customer: match.customer,
      product: match.product,
      value: match.value,
      status: match.status,
      courier: match.courier,
      tracking_id: match.tracking_id,
      notes: match.notes,
      expected_delivery: match.expected_delivery || null,
      timeline: match.timeline || null,
      is_cancellable: match.is_cancellable
    }
  };
}

/**
 * Tool declaration for Google Gen AI SDK
 */
export const getOrderDetailsDeclaration = {
  name: 'get_order_details',
  description: 'Lookup live details for an Aura Skincare order using its unique order ID (e.g. ORD-101, ORD-102, ORD-103). Returns status, product, customer name, courier tracking, and notes.',
  parameters: {
    type: 'OBJECT',
    properties: {
      order_id: {
        type: 'STRING',
        description: 'The unique order identifier to lookup, e.g., ORD-101'
      }
    },
    required: ['order_id']
  }
};

export default {
  getOrderDetails,
  getOrderDetailsDeclaration
};
