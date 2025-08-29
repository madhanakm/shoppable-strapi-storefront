import { getPendingOrders, updatePendingOrderStatus } from './pending-orders';

export const recoverPendingPayments = async () => {
  try {
    console.log('Checking for pending payments to recover...');
    
    // Get all pending orders from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(`https://api.dharaniherbbals.com/api/pending-orders?filters[createdAt][$gte]=${oneDayAgo}&filters[status][$eq]=pending`);
    
    if (!response.ok) return;
    
    const data = await response.json();
    const pendingOrders = data.data || [];
    
    for (const order of pendingOrders) {
      const orderData = order.attributes || order;
      
      // Only mark very old orders as failed (24+ hours)
      const createdTime = new Date(orderData.createdAt).getTime();
      if (Date.now() - createdTime > 24 * 60 * 60 * 1000) {
        console.log('Marking expired order as failed:', orderData.orderNumber);
        await updatePendingOrderStatus(orderData.orderNumber, 'failed', undefined, 'Order expired after 24 hours');
      }
    }
  } catch (error) {
    console.error('Error in payment recovery:', error);
  }
};