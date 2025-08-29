import { useState, useEffect } from 'react';
import { getPendingOrders, PendingOrderData } from '@/services/pending-orders';

export const useOrderRecovery = (userEmail?: string) => {
  const [recoveredOrder, setRecoveredOrder] = useState<PendingOrderData | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkForCompletedOrders = async () => {
    if (!userEmail) return;
    
    setIsChecking(true);
    try {
      const pendingOrders = await getPendingOrders(userEmail);
      
      // Find recently completed orders (within last 30 minutes)
      const recentlyCompleted = pendingOrders.find(order => 
        order.status === 'completed' && 
        new Date(order.updatedAt || order.createdAt).getTime() > Date.now() - 30 * 60 * 1000
      );
      
      if (recentlyCompleted) {
        setRecoveredOrder(recentlyCompleted);
        // Clear from localStorage if exists
        localStorage.removeItem(`pendingOrder_${recentlyCompleted.orderNumber}`);
      }
    } catch (error) {
      console.error('Error checking for completed orders:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const dismissRecoveredOrder = () => {
    setRecoveredOrder(null);
  };

  useEffect(() => {
    if (userEmail) {
      checkForCompletedOrders();
    }
  }, [userEmail]);

  return {
    recoveredOrder,
    isChecking,
    checkForCompletedOrders,
    dismissRecoveredOrder
  };
};