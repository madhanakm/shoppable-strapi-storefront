import { useState, useEffect, useCallback } from 'react';
import { 
  getPendingOrders, 
  cancelPendingOrder, 
  processPendingOrder,
  completePendingOrder,
  failPendingOrder,
  PendingOrderData 
} from '@/services/pending-orders';

export const usePendingOrders = (userEmail?: string) => {
  const [pendingOrders, setPendingOrders] = useState<PendingOrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orders = await getPendingOrders(userEmail);
      setPendingOrders(orders);
      console.log(`Fetched ${orders.length} pending orders for user:`, userEmail);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pending orders';
      console.error('Error fetching pending orders:', err);
      setError(errorMessage);
      setPendingOrders([]); // Clear orders on error
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      fetchPendingOrders();
    }
  }, [userEmail, fetchPendingOrders]);

  const updateOrderStatus = useCallback((orderNumber: string, status: 'cancelled' | 'processing' | 'completed' | 'failed', paymentId?: string, failureReason?: string) => {
    setPendingOrders(prev => 
      prev.map(order => 
        order.orderNumber === orderNumber 
          ? { ...order, status, ...(paymentId && { paymentId }), ...(failureReason && { failureReason }) }
          : order
      )
    );
  }, []);

  const cancelOrder = async (orderNumber: string, reason?: string): Promise<boolean> => {
    try {
      const success = await cancelPendingOrder(orderNumber, reason);
      if (success) {
        updateOrderStatus(orderNumber, 'cancelled', undefined, reason);
        console.log(`Order ${orderNumber} cancelled successfully`);
      } else {
        throw new Error('Failed to cancel order on server');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      console.error('Error cancelling order:', err);
      setError(errorMessage);
      return false;
    }
  };

  const processOrder = async (orderNumber: string): Promise<boolean> => {
    try {
      const success = await processPendingOrder(orderNumber);
      if (success) {
        updateOrderStatus(orderNumber, 'processing');
        console.log(`Order ${orderNumber} marked as processing`);
      } else {
        throw new Error('Failed to process order on server');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process order';
      console.error('Error processing order:', err);
      setError(errorMessage);
      return false;
    }
  };

  const completeOrder = async (orderNumber: string, paymentId?: string): Promise<boolean> => {
    try {
      const success = await completePendingOrder(orderNumber, paymentId);
      if (success) {
        updateOrderStatus(orderNumber, 'completed', paymentId);
        console.log(`Order ${orderNumber} completed successfully`);
      } else {
        throw new Error('Failed to complete order on server');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete order';
      console.error('Error completing order:', err);
      setError(errorMessage);
      return false;
    }
  };

  const failOrder = async (orderNumber: string, reason?: string): Promise<boolean> => {
    try {
      const success = await failPendingOrder(orderNumber, reason);
      if (success) {
        updateOrderStatus(orderNumber, 'failed', undefined, reason);
        console.log(`Order ${orderNumber} marked as failed:`, reason);
      } else {
        throw new Error('Failed to update order status on server');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fail order';
      console.error('Error failing order:', err);
      setError(errorMessage);
      return false;
    }
  };

  return {
    pendingOrders,
    loading,
    error,
    refetch: fetchPendingOrders,
    cancelOrder,
    processOrder,
    completeOrder,
    failOrder
  };
};