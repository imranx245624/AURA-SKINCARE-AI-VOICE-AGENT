/**
 * Authoritative Mock Order Database for Aura Skincare
 * Exactly matches the assessment specification.
 */
export const MOCK_ORDERS = [
  {
    order_id: 'ORD-101',
    customer: 'Priya Sharma',
    product: 'Vitamin C Serum (30ml)',
    value: '₹699',
    status: 'Out for Delivery',
    courier: 'BlueDart',
    tracking_id: 'BD-982103',
    notes: 'BlueDart — BD-982103. Expected by 6 PM today',
    expected_delivery: 'By 6 PM today',
    is_cancellable: false
  },
  {
    order_id: 'ORD-102',
    customer: 'Rahul Verma',
    product: 'Hydrating Sunscreen SPF 50',
    value: '₹499',
    status: 'Delivered',
    courier: 'Delhivery',
    tracking_id: 'DL-441029',
    notes: 'Delhivery — DL-441029. Delivered 14 days ago',
    timeline: 'Delivered 14 days ago',
    is_cancellable: false
  },
  {
    order_id: 'ORD-103',
    customer: 'Ananya Patel',
    product: 'Green Tea Face Wash + Toner',
    value: '₹850',
    status: 'Processing',
    courier: null,
    tracking_id: null,
    notes: 'Ordered 3 hours ago. Eligible for cancellation',
    timeline: 'Ordered 3 hours ago',
    is_cancellable: true
  }
];

export default MOCK_ORDERS;
