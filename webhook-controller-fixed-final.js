const crypto = require('crypto');

module.exports = {
  async razorpay(ctx) {
    try {
      const { event, payload } = ctx.request.body;
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const paymentId = payment.id;
        const orderNumber = payment.notes?.order_number;
        
        if (!orderNumber) {
          ctx.body = { status: 'ok', message: 'No order number' };
          return;
        }

        // Check existing order with timeout
        let existingOrder = [];
        try {
          const checkPromise = strapi.entityService.findMany('api::order.order', {
            filters: { ordernum: orderNumber }
          });
          existingOrder = await Promise.race([
            checkPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
        } catch (error) {
          console.log('Check existing order failed, proceeding');
        }
        
        if (existingOrder.length > 0) {
          ctx.body = { status: 'ok', message: 'Order exists' };
          return;
        }
        
        // Find pending order with timeout
        let pendingOrders = [];
        try {
          const pendingPromise = strapi.entityService.findMany('api::pending-order.pending-order', {
            filters: { orderNumber: orderNumber }
          });
          pendingOrders = await Promise.race([
            pendingPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
        } catch (error) {
          console.log('Pending order check failed, treating as mobile order');
        }
        
        // Mobile app order (no pending order)
        if (pendingOrders.length === 0) {
          const customerName = payment.notes?.customer_name;
          const customerEmail = payment.notes?.customer_email;
          const customerPhone = payment.notes?.customer_phone;
          const orderTotal = payment.amount / 100;
          
          if (customerName && customerEmail && customerPhone) {
            const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
            
            try {
              await strapi.entityService.create('api::order.order', {
                data: {
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
                }
              });
              
              // Send notifications async
              setTimeout(async () => {
                const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
                
                try {
                  await fetch('https://api.dharaniherbbals.com/api/order-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      data: { mobile: cleanPhone, orderNumber: orderNumber, amount: orderTotal }
                    })
                  });
                } catch (e) {}
                
                try {
                  await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      mobile: cleanPhone, orderNumber: orderNumber, amount: orderTotal
                    })
                  });
                } catch (e) {}
              }, 1000);
              
              ctx.body = { status: 'ok', message: 'Mobile order created' };
              return;
              
            } catch (createError) {
              console.error('Mobile order creation failed:', createError.message);
              ctx.body = { status: 'error', message: 'Order creation failed' };
              return;
            }
          }
        }
        
        // Website order
        if (pendingOrders.length > 0) {
          const order = pendingOrders[0];
          const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          
          try {
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
                prodid: order.items.map(item => item.id).join(' | '),
                quantity: String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
                remarks: `Website Payment ID: ${paymentId}`,
                publishedAt: new Date().toISOString()
              }
            });
            
            // Update pending order async
            setTimeout(async () => {
              try {
                await strapi.entityService.update('api::pending-order.pending-order', order.id, {
                  data: { status: 'completed', paymentId }
                });
              } catch (e) {}
            }, 500);
            
            // Send notifications async
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
              } catch (e) {}
              
              try {
                await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mobile: cleanPhone, orderNumber: order.orderNumber, amount: order.total
                  })
                });
              } catch (e) {}
            }, 1000);
            
            ctx.body = { status: 'ok', message: 'Website order created' };
            
          } catch (createError) {
            console.error('Website order creation failed:', createError.message);
            ctx.body = { status: 'error', message: 'Order creation failed' };
          }
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      console.error('Webhook error:', error.message);
      ctx.body = { status: 'error', message: error.message };
    }
  }
};