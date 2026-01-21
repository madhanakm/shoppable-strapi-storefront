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

        // Respond immediately to prevent timeout
        ctx.body = { status: 'ok', message: 'Processing order' };
        
        // Process order in background with retry
        setImmediate(async () => {
          let retryCount = 0;
          const maxRetries = 5;
          
          while (retryCount < maxRetries) {
            try {
              // Check existing order
              let existingOrder = [];
              try {
                existingOrder = await Promise.race([
                  strapi.entityService.findMany('api::order.order', {
                    filters: { ordernum: orderNumber }
                  }),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
                ]);
              } catch (error) {
                if (retryCount === maxRetries - 1) return;
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                continue;
              }
              
              if (existingOrder.length > 0) {
                return; // Order already exists
              }
              
              // Find pending order with timeout
              let pendingOrders = [];
              try {
                pendingOrders = await Promise.race([
                  strapi.entityService.findMany('api::pending-order.pending-order', {
                    filters: { orderNumber: orderNumber }
                  }),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
                ]);
              } catch (error) {
                if (retryCount === maxRetries - 1) return;
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                continue;
              }
              
              // Create order if pending order exists
              if (pendingOrders.length > 0) {
                const order = pendingOrders[0];
                const orderData = order.attributes || order;
                const finalInvoiceNumber = invoiceNumber || `DH${String(Date.now()).slice(-7)}`;
                
                // Validate required data
                if (!orderData.customerInfo?.name || !orderData.orderNumber) {
                  return; // Missing required data
                }
                
                const result = await Promise.race([
                  strapi.entityService.create('api::order.order', {
                    data: {
                      ordernum: orderData.orderNumber,
                      invoicenum: finalInvoiceNumber,
                      totalValue: orderData.total,
                      total: orderData.total,
                      shippingCharges: orderData.shippingCharges || 0,
                      shippingRate: orderData.shippingCharges || 0,
                      customername: orderData.customerInfo.name,
                      phoneNum: orderData.customerInfo.phone,
                      email: orderData.customerInfo.email,
                      shippingAddress: `${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.state} - ${orderData.customerInfo.pincode}`,
                      billingAddress: `${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.state} - ${orderData.customerInfo.pincode}`,
                      payment: 'Online Payment',
                      communication: orderData.communication || 'website',
                      Name: orderData.items ? orderData.items.map(item => item.name).join(' | ') : 'Online Order',
                      price: orderData.items ? orderData.items.map(item => `${item.name}: ${item.price} x ${item.quantity}`).join(' | ') : `Order: ₹${orderData.total}`,
                      skuid: orderData.items ? orderData.items.map(item => item.skuid || item.id).join(' | ') : 'online_order',
                      prodid: orderData.items ? orderData.items.map(item => item.id).join(' | ') : 'online_order',
                      quantity: orderData.items ? String(orderData.items.reduce((sum, item) => sum + item.quantity, 0)) : '1',
                      remarks: `Payment ID: ${paymentId}`,
                      publishedAt: new Date().toISOString()
                    }
                  }),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000))
                ]);
                
                // Update pending order with error handling
                try {
                  await strapi.entityService.update('api::pending-order.pending-order', order.id, {
                    data: { status: 'completed', paymentId }
                  });
                } catch (updateError) {
                  // Continue even if pending order update fails
                }
                
                // Send notifications
                const cleanPhone = orderData.customerInfo.phone.replace(/[^0-9]/g, '');
                
                fetch('https://api.dharaniherbbals.com/api/order-sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    data: { mobile: cleanPhone, orderNumber: orderData.orderNumber, amount: orderData.total }
                  })
                }).catch(() => {});
                
                fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mobile: cleanPhone, orderNumber: orderData.orderNumber, amount: orderData.total
                  })
                }).catch(() => {});
                
                return; // Success, exit retry loop
              }
              
              return; // No pending order found
              
            } catch (error) {
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // 2s, 4s, 6s delays
              }
            }
          }
        });
        
        return;
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      ctx.body = { status: 'error', message: error.message };
    }
  }
};