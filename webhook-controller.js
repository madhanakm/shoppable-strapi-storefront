// Place this file at: src/api/webhook/controllers/webhook.js in your Strapi backend

const crypto = require('crypto');

module.exports = {
  async razorpay(ctx) {
    try {
      const webhookSecret = 'dh_ecom_webhook_2024_secure_key_dhtransactions';
      const signature = ctx.request.headers['x-razorpay-signature'];
      
      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(ctx.request.body))
          .digest('hex');
        
        if (signature !== expectedSignature) {
          return ctx.badRequest('Invalid signature');
        }
      }
      
      const { event, payload } = ctx.request.body;
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        
        const pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
          filters: { razorpayOrderId: orderId }
        });
        
        if (pendingOrders.length > 0) {
          const order = pendingOrders[0];
          const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          
          await strapi.entityService.create('api::order.order', {
            data: {
              ordernum: order.orderNumber,
              invoicenum: invoiceNumber,
              totalValue: order.total,
              customername: order.customerInfo.name,
              phoneNum: order.customerInfo.phone,
              email: order.customerInfo.email,
              payment: 'Online Payment',
              remarks: `Payment ID: ${paymentId}`
            }
          });
          
          await strapi.entityService.update('api::pending-order.pending-order', order.id, {
            data: { status: 'completed', paymentId }
          });
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Webhook failed' };
    }
  }
};