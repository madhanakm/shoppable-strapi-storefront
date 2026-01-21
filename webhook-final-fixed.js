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
        
        // Add small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        
        // Process order in background with retry
        setImmediate(async () => {
          let retryCount = 0;
          const maxRetries = 10; // Increased retries
          const maxTotalTime = 300000; // 5 minutes max
          const startTime = Date.now();
          
          while (retryCount < maxRetries) {
            try {
              // Add exponential backoff with jitter
              if (retryCount > 0) {
                const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 30000);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
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
                
                // Robust data extraction
                const orderData = {
                  orderNumber: order.orderNumber || order.attributes?.orderNumber,
                  total: order.total || order.attributes?.total,
                  shippingCharges: order.shippingCharges || order.attributes?.shippingCharges || 0,
                  communication: order.communication || order.attributes?.communication || 'website',
                  items: order.items || order.attributes?.items || [],
                  customerInfo: {
                    name: order.customerInfo?.name || order.attributes?.customerInfo?.name || order.customer_name || order.attributes?.customer_name,
                    phone: order.customerInfo?.phone || order.attributes?.customerInfo?.phone || order.customer_phone || order.attributes?.customer_phone,
                    email: order.customerInfo?.email || order.attributes?.customerInfo?.email || order.customer_email || order.attributes?.customer_email,
                    address: order.customerInfo?.address || order.attributes?.customerInfo?.address || order.customer_address || order.attributes?.customer_address,
                    city: order.customerInfo?.city || order.attributes?.customerInfo?.city || order.customer_city || order.attributes?.customer_city,
                    state: order.customerInfo?.state || order.attributes?.customerInfo?.state || order.customer_state || order.attributes?.customer_state,
                    pincode: order.customerInfo?.pincode || order.attributes?.customerInfo?.pincode || order.customer_pincode || order.attributes?.customer_pincode
                  }
                };
                
                const finalInvoiceNumber = invoiceNumber || `DH${String(Date.now()).slice(-7)}`;
                
                // Validate required data
                if (!orderData.orderNumber || !orderData.customerInfo.name || !orderData.customerInfo.phone || !orderData.total) {
                  continue; // Skip this retry, try again
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
                
                // Update pending order
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
              // Check if we've exceeded total time limit
              if (Date.now() - startTime > maxTotalTime) {
                // Store in failed queue for manual processing
                try {
                  await strapi.entityService.create('api::failed-webhook.failed-webhook', {
                    data: {
                      paymentId,
                      orderNumber,
                      invoiceNumber,
                      errorMessage: `Timeout after ${maxTotalTime}ms: ${error.message}`,
                      webhookData: JSON.stringify({ event, payload }),
                      retryCount,
                      status: 'timeout',
                      createdAt: new Date().toISOString()
                    }
                  });
                } catch (queueError) {
                  require('fs').appendFileSync('/tmp/webhook-failures.log', 
                    `${new Date().toISOString()} - TIMEOUT - ${paymentId} - ${orderNumber}\n`
                  );
                }
                break;
              }
              
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
              } else {
                // Final fallback - store in failed orders queue for manual processing
                try {
                  await strapi.entityService.create('api::failed-webhook.failed-webhook', {
                    data: {
                      paymentId,
                      orderNumber,
                      invoiceNumber,
                      errorMessage: error.message,
                      webhookData: JSON.stringify({ event, payload }),
                      retryCount: maxRetries,
                      status: 'failed',
                      createdAt: new Date().toISOString()
                    }
                  });
                } catch (queueError) {
                  // Even queue failed, log to file as last resort
                  require('fs').appendFileSync('/tmp/webhook-failures.log', 
                    `${new Date().toISOString()} - ${paymentId} - ${orderNumber} - ${error.message}\n`
                  );
                }
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