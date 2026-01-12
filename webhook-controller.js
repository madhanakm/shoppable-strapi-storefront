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
          
          // Check if order already exists to prevent duplicates
          const existingOrder = await strapi.entityService.findMany('api::order.order', {
            filters: { 
              ordernum: order.orderNumber 
            }
          });
          
          if (existingOrder.length > 0) {
            console.log(`Order ${order.orderNumber} already exists, skipping duplicate`);
            ctx.body = { status: 'ok', message: 'Order already processed' };
            return;
          }
          
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
          } catch (error) {
            invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          }
          
          // Create complete order data
          const orderData = {
            ordernum: order.orderNumber,
            invoicenum: invoiceNumber,
            totalValue: order.total,
            total: order.total,
            shippingCharges: order.shippingCharges || 0,
            shippingRate: order.shippingCharges || 0,
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
            prodid: order.items.map(item => item.productId || item.originalProductId || item.id).join(' | '),
            remarks: `Payment ID: ${paymentId}. ${order.notes || ''}`,
            notes: `Online Payment - ${paymentId}`,
            quantity: String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
            publishedAt: new Date().toISOString()
          };
          
          await strapi.entityService.create('api::order.order', { data: orderData });
          
          await strapi.entityService.update('api::pending-order.pending-order', order.id, {
            data: {
              status: 'completed',
              paymentId: paymentId,
              invoiceNumber: invoiceNumber,
              completedAt: new Date().toISOString()
            }
          });
          
          // Send SMS and WhatsApp notifications
          try {
            const cleanPhone = order.customerInfo.phone.replace(/[^0-9]/g, '');
            
            await fetch('https://api.dharaniherbbals.com/api/order-sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                data: {
                  mobile: cleanPhone,
                  orderNumber: order.orderNumber,
                  amount: order.total
                }
              })
            });
            
            await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mobile: cleanPhone,
                orderNumber: order.orderNumber,
                amount: order.total
              })
            });
          } catch (notificationError) {
            console.error('SMS/WhatsApp notification failed:', notificationError);
          }
          
          console.log('Order completed successfully:', order.orderNumber, 'Invoice:', invoiceNumber);
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Webhook failed' };
    }
  }
};