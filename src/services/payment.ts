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
    console.log('Generated invoice number:', invoiceNumber);
    return invoiceNumber;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return `DH${String(Date.now()).slice(-7)}`;
  }
};

export const generateOrderNumber = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.dharaniherbbals.com/api/order-entries');
    const data = await response.json();
    const count = Array.isArray(data) ? data.length : (data.data?.length || 0);
    const orderNumber = `DH-ECOM-${String(count + 1).padStart(3, '0')}`;
    
    console.log('Generated order number:', orderNumber);
    
    // Store order number in order-entries
    const storeResponse = await fetch('https://api.dharaniherbbals.com/api/order-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { orderNumber } })
    });
    
    if (!storeResponse.ok) {
      console.error('Failed to store order number:', await storeResponse.text());
    } else {
      console.log('Order number stored in order-entries');
    }
    
    return orderNumber;
  } catch (error) {
    console.error('Error generating order number:', error);
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
          await storeOrder(orderData, orderNumber, invoiceNumber, response);
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
  
  const orderPayload = {
    data: {
      ordernum: orderNumber,
      invoicenum: invoiceNumber,
      totalValue: orderData.total,
      total: orderData.total,
      customername: orderData.customerInfo.name,
      phoneNum: orderData.customerInfo.phone,
      email: orderData.customerInfo.email,
      communication: orderData.customerInfo.email,
      payment: 'Online Payment',
      shippingAddress: shippingAddr,
      billingAddress: shippingAddr,
      Name: orderData.items.map(item => `${item.name} (Qty: ${item.quantity}, Price: ${item.price})`).join(' | '),
      remarks: `Payment ID: ${paymentResponse.razorpay_payment_id}`,
      quantity: orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    }
  };

  console.log('Storing Razorpay order with payload:', JSON.stringify(orderPayload, null, 2));
  
  const response = await fetch('https://api.dharaniherbbals.com/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Razorpay order storage error response:', errorText);
    throw new Error(`Failed to store order: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Razorpay order stored successfully:', result);
  return result;
};