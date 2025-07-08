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
  }>;
  total: number;
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

export const generateOrderNumber = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.dharaniherbbals.com/api/order-entries');
    const data = await response.json();
    const count = Array.isArray(data) ? data.length : (data.data?.length || 0);
    const orderNumber = `DH-ECOM-${String(count + 1).padStart(3, '0')}`;
    
    // Store order number in order-entries
    await fetch('https://api.dharaniherbbals.com/api/order-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { orderNumber } })
    });
    
    return orderNumber;
  } catch (error) {
    console.error('Error generating order number:', error);
    return `DH-ECOM-${String(Date.now()).slice(-3)}`;
  }
};

export const initiatePayment = async (orderData: OrderData, orderNumber: string): Promise<any> => {
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
          console.log('Payment successful:', response);
          await storeOrder(orderData, orderNumber, response);
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

const storeOrder = async (orderData: OrderData, orderNumber: string, paymentResponse: any) => {
  const orderPayload = {
    data: {
      orderNumber,
      paymentId: paymentResponse.razorpay_payment_id,
      amount: orderData.total,
      status: 'completed',
      customerName: orderData.customerInfo.name,
      customerEmail: orderData.customerInfo.email,
      customerPhone: orderData.customerInfo.phone,
      shippingAddress: `${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.state} - ${orderData.customerInfo.pincode}`,
      items: orderData.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: item.price * item.quantity
      })),
      paymentMethod: 'razorpay',
      createdAt: new Date().toISOString()
    }
  };

  console.log('Storing order:', orderPayload);
  
  const response = await fetch('https://api.dharaniherbbals.com/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Store order error:', errorText);
    throw new Error(`Failed to store order: ${response.status}`);
  }

  const result = await response.json();
  console.log('Order stored successfully:', result);
  return result;
};