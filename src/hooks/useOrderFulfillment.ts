import { useState } from 'react';
import { fulfillOrder } from '@/services/order-fulfillment';

interface OrderResponse {
  data: {
    id: number;
    attributes: {
      customername: string;
      quantity: string;
      total: number;
      ordernum: string;
      invoicenum: string;
      billingAddress: string;
      shippingAddress: string;
      phoneNum: string;
      email: string;
      Name: string;
      totalValue: number;
      skuid: string;
      prodid: string;
      shippingRate: number;
    };
  };
}

export const useOrderFulfillment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processOrder = async (orderData: OrderResponse) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await fulfillOrder(orderData);
      
      if (!result.success) {
        setError(result.message);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process order';
      setError(errorMessage);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processOrder,
    isProcessing,
    error
  };
};