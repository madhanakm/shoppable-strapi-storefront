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

        // Check existing order
        let existingOrder = [];
        try {
          existingOrder = await strapi.entityService.findMany('api::order.order', {
            filters: { ordernum: orderNumber }
          });
        } catch (error) {
          console.log('Check existing order failed');
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
          console.log('Pending order check failed');
        }
        
        // Check if it's mobile app order from pending order communication field
        const isMobileOrder = pendingOrders.length > 0 && 
          (pendingOrders[0].communication === 'mobile-app' || pendingOrders[0].communication === 'mobile_app');
        
        // Mobile app order (has pending order with mobile communication)
        if (isMobileOrder) {
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
                communication: 'mobile_app',
                Name: order.items ? order.items.map(item => item.name).join(' | ') : 'Mobile App Order',
                price: order.items ? order.items.map(item => `${item.name}: ${item.price} x ${item.quantity}`).join(' | ') : `Mobile Order: ₹${order.total}`,
                skuid: order.items ? order.items.map(item => item.skuid || item.id).join(' | ') : 'mobile_order',
                prodid: order.items ? order.items.map(item => item.id).join(' | ') : 'mobile_order',
                quantity: order.items ? String(order.items.reduce((sum, item) => sum + item.quantity, 0)) : '1',
                remarks: `Mobile App Payment ID: ${paymentId}`,
                publishedAt: new Date().toISOString()
              }
            });
            
            // Update pending order
            setTimeout(async () => {
              try {
                await strapi.entityService.update('api::pending-order.pending-order', order.id, {
                  data: { status: 'completed', paymentId }
                });
              } catch (e) {}
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
            
            ctx.body = { status: 'ok', message: 'Mobile order created' };
            return;
            
          } catch (createError) {
            console.error('Mobile order creation failed:', createError.message);
            ctx.body = { status: 'error', message: 'Mobile order creation failed' };
            return;
          }
        }
        
        // Website order (has pending order with website communication)
        if (pendingOrders.length > 0 && !isMobileOrder) {
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
            
            // Update pending order
            setTimeout(async () => {
              try {
                await strapi.entityService.update('api::pending-order.pending-order', order.id, {
                  data: { status: 'completed', paymentId }
                });
              } catch (e) {}
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
            ctx.body = { status: 'error', message: 'Website order creation failed' };
          }
        }
        
        // Fallback: No pending order found, try payment notes (old mobile app)
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
              
              // Send notifications
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
              
              ctx.body = { status: 'ok', message: 'Fallback mobile order created' };
              return;
              
            } catch (createError) {
              console.error('Fallback mobile order creation failed:', createError.message);
              ctx.body = { status: 'error', message: 'Fallback order creation failed' };
              return;
            }
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