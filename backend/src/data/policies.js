/**
 * Aura Skincare Official Brand Information and Policies
 * Sourced directly from the Datastraw Assessment Specification.
 */

export const BRAND_INFO = {
  name: 'Aura Skincare',
  tagline: 'Simple, effective organic skincare',
  overview: 'Aura Skincare is a premium organic Indian skincare brand focused on simple, effective skincare products made with thoughtfully selected ingredients.',
  agent: {
    name: 'Aria',
    role: 'Customer Support Specialist',
    persona: 'Friendly, professional, and concise Indian customer support specialist.'
  }
};

export const POLICIES = {
  shipping: {
    freeShippingThreshold: 499,
    standardFee: 50,
    deliveryTimeline: '3–5 business days',
    description: 'Free delivery on orders above ₹499. Orders below ₹499 have a ₹50 shipping fee. Standard delivery takes 3–5 business days.',
    boundaryNote: 'The policy explicitly grants free delivery for orders above ₹499 and charges ₹50 for orders below ₹499. For an exact order value of ₹499, state the rule clearly as outlined in the policy.'
  },
  returnsAndRefunds: {
    returnWindowDays: 7,
    conditions: 'Returns are accepted within 7 days of delivery for unopened, unused products in original packaging.',
    damagedReportingWindowHours: 48,
    damagedRequirement: 'Damaged or defective products must be reported within 48 hours of delivery with photos for replacement.',
    openedProducts: 'Opened or used products cannot be returned.',
    pastWindow: 'Products delivered more than 7 days ago cannot be returned.'
  },
  cancellation: {
    allowedStatus: 'Processing',
    disallowedStatuses: ['Shipped', 'Out for Delivery', 'Delivered'],
    policyText: 'Orders can be cancelled only while their status is Processing. Once an order is Shipped or Out for Delivery, it cannot be cancelled (customers may refuse delivery at doorstep).',
    agentLimitation: 'The agent cannot automatically execute cancellations in this system, but can check and communicate eligibility.'
  },
  cashOnDelivery: {
    maxAmount: 2500,
    paymentMethods: 'Cash or UPI at doorstep',
    description: 'COD is available for orders up to ₹2,500. Customers can pay by cash or UPI at the doorstep.'
  }
};

export default {
  BRAND_INFO,
  POLICIES
};
