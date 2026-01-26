export interface PendingOrderData {
  orderNumber: string;
  invoiceNumber: string; // Empty for pending/failed orders, populated only for successful orders
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    skuid?: string;
  }>;
  total: number;
  shippingCharges: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'online' | 'cod';
  notes?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  failureReason?: string;
  orderType?: 'DH Online TN' | 'DH Online OS';
}

export const createPendingOrder = async (orderData: PendingOrderData): Promise<string | null> => {
  try {
    // Validate required fields
    if (!orderData.orderNumber || !orderData.customerInfo?.email || !orderData.items?.length) {
      throw new Error('Missing required order data');
    }

    // Determine orderType based on state
    const orderType = orderData.customerInfo.state?.toLowerCase() === 'tamil nadu' || 
                      orderData.customerInfo.state?.toLowerCase() === 'tamilnadu' ? 
                      'DH Online TN' : 'DH Online OS';
    
    // Add orderType to order data
    const orderDataWithType = {
      ...orderData,
      orderType
    };

    // Always create a new pending order - remove duplicate check
    // Each order should have a unique order number, so duplicates shouldn't occur
    const response = await fetch('https://api.dharaniherbbals.com/api/pending-orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ data: orderDataWithType })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const orderId = result.data?.id;
    
    if (!orderId) {
      throw new Error('No order ID returned from API');
    }
    
    console.log('Pending order created successfully:', orderData.orderNumber, 'ID:', orderId);
    return orderId;
  } catch (error) {
    console.error('Error creating pending order:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const updatePendingOrderStatus = async (
  orderNumber: string, 
  status: 'processing' | 'completed' | 'failed' | 'cancelled',
  paymentId?: string,
  failureReason?: string
): Promise<boolean> => {
  try {
    console.log(`Updating order ${orderNumber} status to ${status}`);
    
    if (!orderNumber || !status) {
      console.error('Missing required parameters:', { orderNumber, status });
      return false;
    }

    const response = await fetch(`https://api.dharaniherbbals.com/api/pending-orders?filters[orderNumber][$eq]=${encodeURIComponent(orderNumber)}&sort=createdAt:desc`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.error(`Failed to fetch order ${orderNumber}:`, response.status);
      return false;
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      console.error(`Order not found: ${orderNumber}`);
      return false;
    }

    const order = data.data[0];
    const currentOrder = order.attributes || order;
    
    // Verify we have the correct order
    if (currentOrder.orderNumber !== orderNumber) {
      console.error(`Order number mismatch. Expected: ${orderNumber}, Found: ${currentOrder.orderNumber}`);
      return false;
    }

    const pendingOrderId = order.id;
    console.log(`Found order ${orderNumber} (ID: ${pendingOrderId}) with current status: ${currentOrder.status}`);
    
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      ...(paymentId && { paymentId }),
      ...(failureReason && { failureReason })
    };

    console.log(`Updating order ${orderNumber} with data:`, updateData);

    const updateResponse = await fetch(`https://api.dharaniherbbals.com/api/pending-orders/${pendingOrderId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ data: updateData })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Failed to update order ${orderNumber}:`, updateResponse.status, errorText);
      return false;
    }

    const result = await updateResponse.json();
    console.log(`Order ${orderNumber} status successfully updated to ${status}`, result);
    return true;
  } catch (error) {
    console.error(`Error updating pending order ${orderNumber} status:`, error);
    return false;
  }
};

export const getPendingOrders = async (userId?: string): Promise<PendingOrderData[]> => {
  try {
    let url = 'https://api.dharaniherbbals.com/api/pending-orders?sort=createdAt:desc';
    if (userId) {
      url += `&filters[customerInfo][email][$eq]=${encodeURIComponent(userId)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle both Strapi v4 (attributes) and direct data structures
    const orders = data.data?.map((item: any) => {
      const orderData = item.attributes || item;
      // Ensure all required fields exist
      return {
        ...orderData,
        id: item.id || orderData.id,
        items: orderData.items || [],
        customerInfo: orderData.customerInfo || {},
        status: orderData.status || 'pending'
      };
    }) || [];
    
    return orders;
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const cancelPendingOrder = async (orderNumber: string, reason?: string): Promise<boolean> => {
  return await updatePendingOrderStatus(orderNumber, 'cancelled', undefined, reason);
};

export const processPendingOrder = async (orderNumber: string): Promise<boolean> => {
  return await updatePendingOrderStatus(orderNumber, 'processing');
};

export const completePendingOrder = async (orderNumber: string, paymentId?: string): Promise<boolean> => {
  return await updatePendingOrderStatus(orderNumber, 'completed', paymentId);
};

export const failPendingOrder = async (orderNumber: string, reason?: string): Promise<boolean> => {
  return await updatePendingOrderStatus(orderNumber, 'failed', undefined, reason);
};

export const updatePendingOrderRazorpayId = async (orderNumber: string, razorpayOrderId: string): Promise<boolean> => {
  try {
    console.log(`Fetching order ${orderNumber} to update Razorpay ID`);
    
    const response = await fetch(`https://api.dharaniherbbals.com/api/pending-orders?filters[orderNumber][$eq]=${encodeURIComponent(orderNumber)}&sort=createdAt:desc`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.error(`Failed to fetch order ${orderNumber}:`, response.status);
      return false;
    }

    const data = await response.json();
    console.log(`Fetch result for ${orderNumber}:`, data);
    
    if (!data.data || data.data.length === 0) {
      console.error(`Order not found: ${orderNumber}`);
      return false;
    }

    const order = data.data[0];
    const orderData = order.attributes || order;
    
    // Verify we have the correct order
    if (orderData.orderNumber !== orderNumber) {
      console.error(`Order number mismatch. Expected: ${orderNumber}, Found: ${orderData.orderNumber}`);
      return false;
    }

    const pendingOrderId = order.id;
    console.log(`Updating order ID ${pendingOrderId} (${orderNumber}) with Razorpay ID: ${razorpayOrderId}`);
    
    const updateResponse = await fetch(`https://api.dharaniherbbals.com/api/pending-orders/${pendingOrderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          razorpayOrderId,
          updatedAt: new Date().toISOString()
        }
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Failed to update order ${orderNumber}:`, updateResponse.status, errorText);
      return false;
    }

    const result = await updateResponse.json();
    console.log(`Razorpay order ID updated successfully for ${orderNumber}:`, result);
    return true;
  } catch (error) {
    console.error(`Error updating Razorpay ID for ${orderNumber}:`, error);
    return false;
  }
};

export const updatePendingOrderPaymentDetails = async (
  orderNumber: string, 
  razorpayOrderId?: string, 
  paymentId?: string,
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
  failureReason?: string
): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/pending-orders?filters[orderNumber][$eq]=${encodeURIComponent(orderNumber)}&sort=createdAt:desc`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const pendingOrderId = data.data[0].id;
        const updateData: any = {
          updatedAt: new Date().toISOString()
        };
        
        if (razorpayOrderId) updateData.razorpayOrderId = razorpayOrderId;
        if (paymentId) updateData.paymentId = paymentId;
        if (status) updateData.status = status;
        if (failureReason) updateData.failureReason = failureReason;
        
        const updateResponse = await fetch(`https://api.dharaniherbbals.com/api/pending-orders/${pendingOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: updateData })
        });
        
        console.log(`Updated payment details for ${orderNumber}:`, updateData);
        return updateResponse.ok;
      }
    }
    return false;
  } catch (error) {
    console.error('Error updating pending order payment details:', error);
    return false;
  }
};

export const cleanupExpiredPendingOrders = async (): Promise<void> => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const response = await fetch(`https://api.dharaniherbbals.com/api/pending-orders?filters[createdAt][$lt]=${oneDayAgo}&filters[status][$eq]=pending`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      const expiredOrders = data.data || [];
      
      for (const order of expiredOrders) {
        await updatePendingOrderStatus(order.attributes?.orderNumber || order.orderNumber, 'failed', undefined, 'Order expired');
      }
    }
  } catch (error) {
    console.error('Error cleaning up expired pending orders:', error);
  }
};