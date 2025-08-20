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
    const response = await fetch('https://api.dharaniherbbals.com/api/order-entries');
    const data = await response.json();
    const count = Array.isArray(data) ? data.length : (data.data?.length || 0);
    const orderNumber = `DH-ECOM-${String(count + 1).padStart(3, '0')}`;
    
    
    
    // Store order number in order-entries
    const storeResponse = await fetch('https://api.dharaniherbbals.com/api/order-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { orderNumber } })
    });
    
    if (!storeResponse.ok) {
      
    } else {
      
    }
    
    return orderNumber;
  } catch (error) {
    
    return `DH-ECOM-${String(Date.now()).slice(-3)}`;
  }
};

export const initiatePayment = async (orderData: OrderData, orderNumber: string, invoiceNumber: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    const options = {
      key: 'rzp_live_RoueJU66A0iiz5',
      amount: Math.round(orderData.total * 100),
      currency: 'INR',
      name: 'Dharani Herbbals',
      description: `Order #${orderNumber}`,
      receipt: orderNumber,
      payment_capture: 1,
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
          console.log('Payment successful, storing order:', { orderNumber, paymentId: response.razorpay_payment_id });
          await storeOrder(orderData, orderNumber, invoiceNumber, response);
          console.log('Order stored successfully');
          resolve(response);
        } catch (error) {
          console.error('Error storing order:', error);
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled'))
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
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
    
    // Send SMS
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
    });
    
    // Send WhatsApp message
    fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: cleanPhone,
        orderNumber: orderNumber,
        amount: orderData.total
      })
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
  
  return result;
};