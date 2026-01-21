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
        
        const orderNumber = payment.notes?.order_number;
        
        if (!orderNumber) {
          console.log('No order number found in payment notes');
          ctx.body = { status: 'ok', message: 'No order number found' };
          return;
        }

        // Check if order already exists to prevent duplicates
        const existingOrder = await strapi.entityService.findMany('api::order.order', {
          filters: { 
            $or: [
              { ordernum: orderNumber },
              { remarks: { $contains: paymentId } }
            ]
          }
        });
        
        if (existingOrder.length > 0) {
          console.log(`Order ${orderNumber} already exists, skipping duplicate`);
          ctx.body = { status: 'ok', message: 'Order already processed' };
          return;
        }
        
        // Find pending order by order number OR razorpay order ID OR mobile payment reference
        const pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
          filters: {
            $or: [
              { orderNumber: orderNumber },
              { razorpayOrderId: orderId },
              { mobilePaymentRef: paymentId }
            ]
          }
        });
        
        // If no pending order found, try to create order directly from payment notes (mobile app)
        if (pendingOrders.length === 0) {
          console.log('No pending order found, attempting to create order from payment notes');
          
          // Extract order details from payment notes
          const customerName = payment.notes?.customer_name;
          const customerEmail = payment.notes?.customer_email;
          const customerPhone = payment.notes?.customer_phone;
          const orderTotal = payment.amount / 100;
          
          if (customerName && customerEmail && customerPhone) {
            const invoiceNumber = payment.notes?.invoice_number || `DH${String(Date.now()).slice(-7)}`;
            
            // Create order directly from payment data
            await strapi.entityService.create('api::order.order', {
              data: {
                ordernum: orderNumber,
                invoicenum: invoiceNumber,
                totalValue: orderTotal,
                total: orderTotal,
                shippingCharges: payment.notes?.shipping_charges || 0,
                shippingRate: payment.notes?.shipping_charges || 0,
                customername: customerName,
                phoneNum: customerPhone,
                email: customerEmail,
                shippingAddress: payment.notes?.shipping_address || 'Mobile App Order',
                billingAddress: payment.notes?.billing_address || payment.notes?.shipping_address || 'Mobile App Order',
                payment: 'Online Payment',
                communication: 'mobile_app',
                Name: payment.notes?.items || 'Mobile App Order',
                price: payment.notes?.item_details || `Mobile Order: ${orderTotal}`,
                skuid: payment.notes?.skuids || 'mobile_order',
                prodid: payment.notes?.product_ids || 'mobile_order',
                quantity: payment.notes?.total_quantity || '1',
                remarks: `Mobile App Payment ID: ${paymentId}. ${payment.notes?.notes || ''}`,
                publishedAt: new Date().toISOString()
              }
            });
            
            console.log(`Mobile order ${orderNumber} created successfully from payment notes`);
            
            // Send notifications for mobile orders
            try {
              const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
              
              await fetch('https://api.dharaniherbbals.com/api/order-sms', {
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
              
              await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  mobile: cleanPhone,
                  orderNumber: orderNumber,
                  amount: orderTotal
                })
              });
            } catch (notificationError) {
              console.error('Mobile order SMS/WhatsApp notification failed:', notificationError);
            }
            
            ctx.body = { status: 'ok', message: 'Mobile order created successfully' };
            return;
          }
        }
        
        // Handle website orders (with pending orders)
        if (pendingOrders.length > 0) {
          const order = pendingOrders[0];
          
          const invoiceNumber = payment.notes?.invoice_number || `DH${String(Date.now()).slice(-7)}`;
          
          // Create complete order with all details
          await strapi.entityService.create('api::order.order', {
            data: {
              ordernum: order.orderNumber,
              invoicenum: invoiceNumber,
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
              communication: 'website',
              Name: order.items.map(item => item.name).join(' | '),
              price: order.items.map(item => `${item.name}: ${item.price} x ${item.quantity}`).join(' | '),
              skuid: order.items.map(item => item.skuid || item.id).join(' | '),
              prodid: order.items.map(item => item.productId || item.originalProductId || item.id).join(' | '),
              quantity: String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
              remarks: `Payment ID: ${paymentId}. ${order.notes || ''}`,
              publishedAt: new Date().toISOString()
            }
          });
          
          // Update pending order status
          await strapi.entityService.update('api::pending-order.pending-order', order.id, {
            data: { 
              status: 'completed', 
              paymentId,
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
          
          console.log(`Order ${order.orderNumber} created successfully via webhook`);
        }
      }
      
      if (event === 'payment.failed') {
        const payment = payload.payment.entity;
        const orderNumber = payment.notes?.order_number;
        
        if (orderNumber) {
          const pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
            filters: { orderNumber: orderNumber }
          });
          
          if (pendingOrders.length > 0) {
            const order = pendingOrders[0];
            await strapi.entityService.update('api::pending-order.pending-order', order.id, {
              data: { 
                status: 'failed', 
                failureReason: 'Payment failed via webhook',
                failedAt: new Date().toISOString()
              }
            });
          }
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      console.error('Webhook error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Webhook failed' };
    }
  }
};