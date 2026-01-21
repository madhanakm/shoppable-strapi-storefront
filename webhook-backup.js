const crypto = require('crypto');

module.exports = {
  async razorpay(ctx) {
    try {
      const { event, payload } = ctx.request.body;
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const paymentId = payment.id;
        const orderNumber = payment.notes?.order_number;
        const invoiceNumber = payment.notes?.invoice_number;
        
        if (!orderNumber) {
          ctx.body = { status: 'ok', message: 'No order number' };
          return;
        }

        // Check existing order
        let existingOrder = [];
        try {
          existingOrder = await strapi.entityService.findMany('api::order.order', {
            filters: { ordernum: orderNumber }
          });
        } catch (error) {
          // Silent fail
        }
        
        if (existingOrder.length > 0) {
          ctx.body = { status: 'ok', message: 'Order exists' };
          return;
        }
        
        // Find pending order
        let pendingOrders = [];
        try {
          pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
            filters: { orderNumber: orderNumber }
          });
        } catch (error) {
          // Silent fail
        }
        
        // Create order if pending order exists
        if (pendingOrders.length > 0) {
          const order = pendingOrders[0];
          const finalInvoiceNumber = invoiceNumber || `DH${String(Date.now()).slice(-7)}`;
          
          try {
            const result = await strapi.entityService.create('api::order.order', {
              data: {
                ordernum: order.orderNumber,
                invoicenum: finalInvoiceNumber,
                totalValue: order.total,
                total: order.total,
                shippingCharges: order.shippingCharges || 0,
                shippingRate: order.shippingCharges || 0,
                customername: order.customerInfo.name,
                phoneNum: order.customerInfo.phone,
                email: order.customerInfo.email,
                shippingAddress: `${order.customerInfo.address}, ${order.customerInfo.city}, ${order.customerInfo.state} - ${order.customerInfo.pincode}`,
                billingAddress: `${order.customerInfo.address}, ${order.customerInfo.city}, ${order.customerInfo.state} - ${order.customerInfo.pincode}`,
                payment: 'Online Payment',
                communication: order.communication || 'website',
                Name: order.items ? order.items.map(item => item.name).join(' | ') : 'Online Order',
                price: order.items ? order.items.map(item => `${item.name}: ${item.price} x ${item.quantity}`).join(' | ') : `Order: ₹${order.total}`,
                skuid: order.items ? order.items.map(item => item.skuid || item.id).join(' | ') : 'online_order',
                prodid: order.items ? order.items.map(item => item.id).join(' | ') : 'online_order',
                quantity: order.items ? String(order.items.reduce((sum, item) => sum + item.quantity, 0)) : '1',
                remarks: `Payment ID: ${paymentId}`,
                publishedAt: new Date().toISOString()
              }
            });
            
            // Update pending order
            setTimeout(async () => {
              try {
                await strapi.entityService.update('api::pending-order.pending-order', order.id, {
                  data: { status: 'completed', paymentId }
                });
              } catch (e) {
                // Silent fail
              }
            }, 500);
            
            // Send notifications
            setTimeout(async () => {
              const cleanPhone = order.customerInfo.phone.replace(/[^0-9]/g, '');
              
              try {
                await fetch('https://api.dharaniherbbals.com/api/order-sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    data: { mobile: cleanPhone, orderNumber: order.orderNumber, amount: order.total }
                  })
                });
              } catch (e) {
                // Silent fail
              }
              
              try {
                await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mobile: cleanPhone, orderNumber: order.orderNumber, amount: order.total
                  })
                });
              } catch (e) {
                // Silent fail
              }
            }, 1000);
            
            ctx.body = { status: 'ok', message: 'Order created' };
            return;
            
          } catch (createError) {
            ctx.body = { status: 'error', message: 'Order creation failed' };
            return;
          }
        }
        
        ctx.body = { status: 'ok', message: 'No pending order found' };
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      ctx.body = { status: 'error', message: error.message };
    }
  }
};