import { createPendingOrder, updatePendingOrderStatus, updatePendingOrderRazorpayId, updatePendingOrderPaymentDetails, PendingOrderData } from './pending-orders';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    skuid?: string;
  }>;
  total: number;
  shippingCharges?: number; // Optional shipping charges
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export const generateInvoiceNumber = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.dharaniherbbals.com/api/orders?sort=invoicenum:desc&pagination[limit]=1');
    const data = await response.json();
    
    let nextNumber = 2500; // Starting number
    if (data.data && data.data.length > 0) {
      const lastInvoice = data.data[0].attributes?.invoicenum;
      if (lastInvoice && lastInvoice.startsWith('DH')) {
        const lastNumber = parseInt(lastInvoice.replace('DH', ''));
        nextNumber = lastNumber + 1;
      }
    }
    
    const invoiceNumber = `DH${String(nextNumber).padStart(7, '0')}`;
    
    return invoiceNumber;
  } catch (error) {
    
    return `DH${String(Date.now()).slice(-7)}`;
  }
};

export const generateOrderNumber = async (): Promise<string> => {
  try {
    // Get the latest order numbers from both orders and pending-orders
    const [ordersResponse, pendingOrdersResponse] = await Promise.all([
      fetch('https://api.dharaniherbbals.com/api/orders?sort=ordernum:desc&pagination[limit]=1'),
      fetch('https://api.dharaniherbbals.com/api/pending-orders?sort=orderNumber:desc&pagination[limit]=1')
    ]);
    
    let maxNumber = 26; // Starting from 027 since current is 026
    
    // Check latest order from orders collection
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      if (ordersData.data && ordersData.data.length > 0) {
        const lastOrder = ordersData.data[0].attributes?.ordernum || ordersData.data[0].ordernum;
        if (lastOrder && lastOrder.startsWith('DH-ECOM-')) {
          const lastNumber = parseInt(lastOrder.replace('DH-ECOM-', ''));
          if (!isNaN(lastNumber)) {
            maxNumber = Math.max(maxNumber, lastNumber);
          }
        }
      }
    }
    
    // Check latest order from pending-orders collection
    if (pendingOrdersResponse.ok) {
      const pendingData = await pendingOrdersResponse.json();
      if (pendingData.data && pendingData.data.length > 0) {
        const lastPendingOrder = pendingData.data[0].attributes?.orderNumber || pendingData.data[0].orderNumber;
        if (lastPendingOrder && lastPendingOrder.startsWith('DH-ECOM-')) {
          const lastNumber = parseInt(lastPendingOrder.replace('DH-ECOM-', ''));
          if (!isNaN(lastNumber)) {
            maxNumber = Math.max(maxNumber, lastNumber);
          }
        }
      }
    }
    
    // Generate next order number
    const nextNumber = maxNumber + 1;
    const orderNumber = `DH-ECOM-${String(nextNumber).padStart(3, '0')}`;
    
    return orderNumber;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback to timestamp-based number
    return `DH-ECOM-${String(Date.now()).slice(-3)}`;
  }
};

export const initiatePayment = async (orderData: OrderData, orderNumber: string, invoiceNumber: string, notes?: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    try {
      // Validate order data before proceeding
      if (!orderData.customerInfo?.email || !orderData.items?.length) {
        throw new Error('Invalid order data provided');
      }

      // Pending order should already be created in checkout, just update with Razorpay ID
      
      // Store order number for recovery
      localStorage.setItem(`pendingOrder_${orderNumber}`, JSON.stringify({
        orderNumber,
        email: orderData.customerInfo.email,
        timestamp: Date.now()
      }));

      // Create Razorpay order server-side with auto-capture
      const createOrderResponse = await fetch('https://api.dharaniherbbals.com/api/create-razorpay-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            amount: Math.round(orderData.total * 100),
            currency: 'INR',
            receipt: orderNumber
          }
        })
      });
      
      if (!createOrderResponse.ok) {
        await updatePendingOrderStatus(orderNumber, 'failed');
        throw new Error('Failed to create Razorpay order');
      }
      
      const response = await createOrderResponse.json();
      console.log('Full backend response:', JSON.stringify(response, null, 2));
      
      const razorpayOrderId = response.razorpayOrderId;
      console.log('Extracted razorpayOrderId:', razorpayOrderId);
      
      if (!razorpayOrderId) {
        console.error('Response structure:', response);
        await updatePendingOrderStatus(orderNumber, 'failed');
        throw new Error('No Razorpay order ID returned');
      }
      
      // Update pending order with Razorpay order ID immediately
      console.log('Attempting to update Razorpay order ID for:', orderNumber, 'with ID:', razorpayOrderId);
      const razorpayUpdateSuccess = await updatePendingOrderRazorpayId(orderNumber, razorpayOrderId);
      if (!razorpayUpdateSuccess) {
        console.error('Failed to update Razorpay order ID for:', orderNumber);
        // Don't throw error, continue with payment
      } else {
        console.log('Razorpay order ID updated successfully for order:', orderNumber);
      }
      
      const options = {
        key: 'rzp_live_RoueJU66A0iiz5',
        amount: Math.round(orderData.total * 100),
        currency: 'INR',
        name: 'Dharani Herbbals',
        description: `Order #${orderNumber}`,
        order_id: razorpayOrderId,
      prefill: {
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email,
        contact: orderData.customerInfo.phone,
      },
      theme: {
        color: '#22c55e'
      },
      handler: async (response: any) => {
        try {
          // First update pending order status to processing with payment ID
          await updatePendingOrderStatus(orderNumber, 'processing', response.razorpay_payment_id);
          
          // Store the order in main orders collection
          await storeOrder(orderData, orderNumber, invoiceNumber, response);
          
          // Mark as completed only after successful order storage
          await updatePendingOrderStatus(orderNumber, 'completed', response.razorpay_payment_id);
          
          // Update pending order with invoice number
          await fetch(`https://api.dharaniherbbals.com/api/pending-orders?filters[orderNumber][$eq]=${encodeURIComponent(orderNumber)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          }).then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              if (data.data && data.data.length > 0) {
                const pendingOrderId = data.data[0].id;
                await fetch(`https://api.dharaniherbbals.com/api/pending-orders/${pendingOrderId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    data: {
                      invoiceNumber,
                      updatedAt: new Date().toISOString()
                    }
                  })
                });
              }
            }
          });
          
          localStorage.removeItem(`pendingOrder_${orderNumber}`);
          resolve(response);
        } catch (error) {
          console.error('Order storage failed after successful payment:', error);
          // Mark as payment_success_order_failed to handle later
          await updatePendingOrderStatus(orderNumber, 'payment_success_order_failed', response?.razorpay_payment_id, error.message);
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed for order:', orderNumber, '- keeping as pending');
          reject(new Error('Payment cancelled'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    // Handle payment failures
    rzp.on('payment.failed', async (response: any) => {
      console.log('Payment failed:', response.error);
      await updatePendingOrderStatus(
        orderNumber, 
        'failed', 
        response.error.metadata?.payment_id,
        `Payment failed: ${response.error.description || response.error.reason}`
      );
      reject(new Error(`Payment failed: ${response.error.description || response.error.reason}`));
    });
    
    rzp.open();
    
    } catch (error) {
      reject(error);
    }
  });
};

const storeOrder = async (orderData: OrderData, orderNumber: string, invoiceNumber: string, paymentResponse: any) => {
  const shippingAddr = `${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.state} - ${orderData.customerInfo.pincode}`;
  
  // Use shipping charges from OrderData if available, otherwise calculate based on state
  const calculateShippingRate = (state: string) => {
    // Normalize state name for flexible matching
    const normalizedState = state.toLowerCase().replace(/\s+/g, '');
    
    // Check if state is Tamil Nadu with flexible matching
    const isTamilNadu = normalizedState.includes('tamilnadu') || 
                       normalizedState === 'tn' ||
                       normalizedState.includes('tamil') && normalizedState.includes('nadu');
    
    // Use default shipping prices
    return isTamilNadu ? 50 : 150;
  };

  const shippingRate = orderData.shippingCharges || calculateShippingRate(orderData.customerInfo.state);
  
  const orderPayload = {
    data: {
      ordernum: orderNumber,
      invoicenum: invoiceNumber,
      totalValue: orderData.total,
      total: orderData.total,
      shippingCharges: shippingRate,
      shippingRate: shippingRate, // Adding shipping rate as a separate field
      customername: orderData.customerInfo.name,
      phoneNum: orderData.customerInfo.phone,
      email: orderData.customerInfo.email,
      communication: 'website',
      payment: 'Online Payment',
      shippingAddress: shippingAddr,
      billingAddress: shippingAddr,
      Name: orderData.items.map(item => item.name).join(' | '),
      price: orderData.items.map(item => `${item.name}: ${item.price} x ${item.quantity}`).join(' | '),
      skuid: orderData.items.map(item => item.skuid || item.id).join(' | '),
      remarks: `Payment ID: ${paymentResponse.razorpay_payment_id}`,
      notes: `Online Payment - ${paymentResponse.razorpay_payment_id}`,
      quantity: String(orderData.items.reduce((sum, item) => sum + item.quantity, 0))
    }
  };

  console.log('Storing order with payload:', orderPayload);
  
  const response = await fetch('https://api.dharaniherbbals.com/api/orders', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  });
  
  console.log('Order API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    
    throw new Error(`Failed to store order: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  // Send order confirmation SMS and WhatsApp message
  try {
    const cleanPhone = orderData.customerInfo.phone.replace(/[^0-9]/g, '');
    
    // Send SMS with error handling
    fetch('https://api.dharaniherbbals.com/api/order-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          mobile: cleanPhone,
          orderNumber: orderNumber,
          amount: orderData.total
        }
      })
    }).catch(error => {
      console.error('Failed to send SMS notification:', error);
    });
    
    // Send WhatsApp message with error handling
    fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: cleanPhone,
        orderNumber: orderNumber,
        amount: orderData.total
      })
    }).catch(error => {
      console.error('Failed to send WhatsApp notification:', error);
    });
  } catch (error) {
    console.error('Error preparing notifications:', error);
  }
  
  return result;
};