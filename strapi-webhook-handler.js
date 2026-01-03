// Strapi webhook handler for Razorpay
// Webhook URL: https://api.dharaniherbbals.com/api/webhooks
// Secret: dh_ecom_webhook_2024_secure_key_dhtransactions

const crypto = require('crypto');

module.exports = {
  async razorpayWebhook(ctx) {
    try {

      
      // Validate webhook signature
      const webhookSecret = 'dh_ecom_webhook_2024_secure_key_dhtransactions';
      const signature = ctx.request.headers['x-razorpay-signature'];
      
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(ctx.request.body))
          .digest('hex');
        
        if (signature !== expectedSignature) {
          console.error('Invalid webhook signature');
          ctx.status = 400;
          ctx.body = { error: 'Invalid signature' };
          return;
        }
        console.log('Webhook signature validated successfully');
      }
      
      const { event, payload } = ctx.request.body;
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        
        console.log('Payment captured:', { orderId, paymentId });
        
        // Find pending order by Razorpay order ID
        const pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
          filters: { razorpayOrderId: orderId }
        });
        
        if (pendingOrders.length > 0) {
          const order = pendingOrders[0];
          console.log('Found pending order:', order.orderNumber);
          
          // Generate invoice number
          const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          
          // Create main order
          const orderData = {
            ordernum: order.orderNumber,
            invoicenum: invoiceNumber,
            totalValue: order.total,
            total: order.total,
            shippingCharges: order.shippingCharges,
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
          
          await strapi.entityService.create('api::order.order', { data: orderData });
          
          // Update pending order
          await strapi.entityService.update('api::pending-order.pending-order', order.id, {
            data: {
              status: 'completed',
              paymentId: paymentId,
              invoiceNumber: invoiceNumber,
              updatedAt: new Date()
            }
          });
          
          console.log('Order completed successfully:', order.orderNumber);
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      console.error('Webhook error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Webhook processing failed' };
    }
  }
};