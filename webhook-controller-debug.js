const crypto = require('crypto');

module.exports = {
  async razorpay(ctx) {
    try {
      console.log('=== WEBHOOK TRIGGERED ===');
      console.log('Headers:', ctx.request.headers);
      console.log('Body:', JSON.stringify(ctx.request.body, null, 2));
      
      const { event, payload } = ctx.request.body;
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const paymentId = payment.id;
        const orderNumber = payment.notes?.order_number;
        
        console.log('Payment captured:', { paymentId, orderNumber });
        console.log('Payment notes:', JSON.stringify(payment.notes, null, 2));
        
        if (!orderNumber) {
          console.log('ERROR: No order number found');
          ctx.body = { status: 'ok', message: 'No order number found' };
          return;
        }
        
        // Extract customer data
        const customerName = payment.notes?.customer_name;
        const customerEmail = payment.notes?.customer_email;
        const customerPhone = payment.notes?.customer_phone;
        const orderTotal = payment.amount / 100;
        
        console.log('Customer data:', { customerName, customerEmail, customerPhone, orderTotal });
        
        if (!customerName || !customerEmail || !customerPhone) {
          console.log('ERROR: Missing customer data');
          ctx.body = { status: 'ok', message: 'Missing customer data' };
          return;
        }
        
        // Check if order exists
        const existingOrder = await strapi.entityService.findMany('api::order.order', {
          filters: { ordernum: orderNumber }
        });
        
        if (existingOrder.length > 0) {
          console.log('Order already exists:', orderNumber);
          ctx.body = { status: 'ok', message: 'Order already processed' };
          return;
        }
        
        console.log('Creating order...');
        
        // Create order
        const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
        
        const orderData = {
          ordernum: orderNumber,
          invoicenum: invoiceNumber,
          totalValue: orderTotal,
          total: orderTotal,
          shippingCharges: parseFloat(payment.notes?.shipping_charges || '0'),
          shippingRate: parseFloat(payment.notes?.shipping_charges || '0'),
          customername: customerName,
          phoneNum: customerPhone,
          email: customerEmail,
          shippingAddress: payment.notes?.shipping_address || 'Mobile App Order',
          billingAddress: payment.notes?.shipping_address || 'Mobile App Order',
          payment: 'Online Payment',
          communication: 'mobile_app',
          Name: payment.notes?.items || 'Mobile App Order',
          price: payment.notes?.item_details || `Mobile Order: ₹${orderTotal}`,
          skuid: 'mobile_order',
          prodid: 'mobile_order',
          quantity: payment.notes?.total_quantity || '1',
          remarks: `Mobile App Payment ID: ${paymentId}`,
          publishedAt: new Date().toISOString()
        };
        
        console.log('Order data to create:', JSON.stringify(orderData, null, 2));
        
        try {
          const createdOrder = await strapi.entityService.create('api::order.order', {
            data: orderData
          });
          
          console.log('Order created successfully:', createdOrder.id);
          
          // Send notifications
          const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
          console.log('Sending notifications to:', cleanPhone);
          
          // SMS
          const smsResponse = await fetch('https://api.dharaniherbbals.com/api/order-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                mobile: cleanPhone,
                orderNumber: orderNumber,
                amount: orderTotal
              }
            })
          });
          
          console.log('SMS response status:', smsResponse.status);
          
          // WhatsApp
          const whatsappResponse = await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mobile: cleanPhone,
              orderNumber: orderNumber,
              amount: orderTotal
            })
          });
          
          console.log('WhatsApp response status:', whatsappResponse.status);
          
          ctx.body = { status: 'ok', message: 'Order created and notifications sent' };
          
        } catch (orderError) {
          console.error('Order creation failed:', orderError);
          ctx.body = { status: 'error', message: 'Order creation failed' };
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      console.error('Webhook error:', error);
      ctx.body = { status: 'error', message: error.message };
    }
  }
};