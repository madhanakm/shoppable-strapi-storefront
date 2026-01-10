// Enhanced webhook controller with detailed logging
// Replace the existing webhook controller with this version

const crypto = require('crypto');

module.exports = {
  async razorpay(ctx) {
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', ctx.request.headers);
    console.log('Body:', JSON.stringify(ctx.request.body, null, 2));
    
    try {
      const webhookSecret = 'dh_ecom_webhook_2024_secure_key_dhtransactions';
      const signature = ctx.request.headers['x-razorpay-signature'];
      
      console.log('Received signature:', signature);
      
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(ctx.request.body))
          .digest('hex');
        
        console.log('Expected signature:', expectedSignature);
        
        if (signature !== expectedSignature) {
          console.error('SIGNATURE MISMATCH!');
          return ctx.badRequest('Invalid signature');
        }
        console.log('✅ Signature validated successfully');
      } else {
        console.log('⚠️ No signature provided');
      }
      
      const { event, payload } = ctx.request.body;
      console.log('Event type:', event);
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        
        console.log('Payment details:', { orderId, paymentId, amount: payment.amount });
        
        // Find pending order
        console.log('Searching for pending order with Razorpay ID:', orderId);
        const pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
          filters: { razorpayOrderId: orderId }
        });
        
        console.log('Found pending orders:', pendingOrders.length);
        
        if (pendingOrders.length > 0) {
          const order = pendingOrders[0];
          console.log('Processing order:', order.orderNumber);
          
          // Generate proper invoice number
          let invoiceNumber;
          try {
            const lastOrder = await strapi.entityService.findMany('api::order.order', {
              sort: 'invoicenum:desc',
              limit: 1
            });
            
            let nextNumber = 2500;
            if (lastOrder.length > 0 && lastOrder[0].invoicenum) {
              const lastInvoice = lastOrder[0].invoicenum;
              if (lastInvoice.startsWith('DH')) {
                const lastNumber = parseInt(lastInvoice.replace('DH', ''));
                nextNumber = lastNumber + 1;
              }
            }
            invoiceNumber = `DH${String(nextNumber).padStart(7, '0')}`;
            console.log('Generated invoice number:', invoiceNumber);
          } catch (error) {
            console.error('Error generating invoice number:', error);
            invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          }
          
          // Create complete order data
          const orderData = {
            ordernum: order.orderNumber,
            invoicenum: invoiceNumber,
            totalValue: order.total,
            total: order.total,
            shippingCharges: order.shippingCharges || 0,
            customername: order.customerInfo.name,
            phoneNum: order.customerInfo.phone,
            email: order.customerInfo.email,
            communication: 'website',
            payment: 'Online Payment',
            shippingAddress: `${order.customerInfo.address}, ${order.customerInfo.city}, ${order.customerInfo.state} - ${order.customerInfo.pincode}`,
            billingAddress: `${order.customerInfo.address}, ${order.customerInfo.city}, ${order.customerInfo.state} - ${order.customerInfo.pincode}`,
            Name: order.items.map(item => item.name).join(' | '),
            price: order.items.map(item => `${item.name}: ${item.price} x ${item.quantity}`).join(' | '),
            skuid: order.items.map(item => item.skuid || item.id).join(' | '),
            remarks: `Payment ID: ${paymentId}`,
            notes: `Online Payment - ${paymentId}`,
            quantity: String(order.items.reduce((sum, item) => sum + item.quantity, 0))
          };
          
          console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
          
          const createdOrder = await strapi.entityService.create('api::order.order', { data: orderData });
          console.log('✅ Order created successfully:', createdOrder.id);
          
          const updatedPendingOrder = await strapi.entityService.update('api::pending-order.pending-order', order.id, {
            data: {
              status: 'completed',
              paymentId: paymentId,
              invoiceNumber: invoiceNumber,
              updatedAt: new Date()
            }
          });
          console.log('✅ Pending order updated successfully');
          
          console.log('🎉 Order completed successfully:', order.orderNumber, 'Invoice:', invoiceNumber);
        } else {
          console.error('❌ No pending order found for Razorpay ID:', orderId);
        }
      } else {
        console.log('ℹ️ Ignoring event type:', event);
      }
      
      ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
      console.log('=== WEBHOOK COMPLETED ===');
    } catch (error) {
      console.error('❌ WEBHOOK ERROR:', error);
      console.error('Error stack:', error.stack);
      ctx.status = 500;
      ctx.body = { error: 'Webhook failed', message: error.message };
    }
  }
};