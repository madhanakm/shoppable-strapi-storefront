const crypto = require('crypto');
const fs = require('fs');

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync('/www/wwwlogs/webhook-debug.log', logEntry);
  } catch (e) {
    console.log(logEntry);
  }
}

module.exports = {
  async razorpay(ctx) {
    try {
      writeLog('=== WEBHOOK START ===');
      
      const { event, payload } = ctx.request.body;
      writeLog(`Event: ${event}`);
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const paymentId = payment.id;
        const orderNumber = payment.notes?.order_number;
        
        writeLog(`Payment ID: ${paymentId}`);
        writeLog(`Order Number: ${orderNumber}`);
        writeLog(`Payment Notes: ${JSON.stringify(payment.notes)}`);
        
        if (!orderNumber) {
          writeLog('ERROR: No order number found');
          ctx.body = { status: 'ok', message: 'No order number' };
          return;
        }

        // Check existing order
        let existingOrder = [];
        try {
          existingOrder = await strapi.entityService.findMany('api::order.order', {
            filters: { ordernum: orderNumber }
          });
          writeLog(`Existing orders found: ${existingOrder.length}`);
        } catch (error) {
          writeLog(`Error checking existing orders: ${error.message}`);
        }
        
        if (existingOrder.length > 0) {
          writeLog('Order already exists, skipping');
          ctx.body = { status: 'ok', message: 'Order exists' };
          return;
        }
        
        // Find pending order
        let pendingOrders = [];
        try {
          pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
            filters: { orderNumber: orderNumber }
          });
          writeLog(`Pending orders found: ${pendingOrders.length}`);
          
          if (pendingOrders.length > 0) {
            writeLog(`Pending order communication: ${pendingOrders[0].communication}`);
          }
        } catch (error) {
          writeLog(`Error finding pending orders: ${error.message}`);
        }
        
        // Check if mobile order
        const isMobileOrder = pendingOrders.length > 0 && 
          (pendingOrders[0].communication === 'mobile-app' || pendingOrders[0].communication === 'mobile_app');
        
        writeLog(`Is mobile order: ${isMobileOrder}`);
        
        if (isMobileOrder) {
          writeLog('Processing mobile app order');
          const order = pendingOrders[0];
          const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          
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
          };
          
          writeLog(`Creating mobile order with data: ${JSON.stringify(orderData)}`);
          
          try {
            const createdOrder = await strapi.entityService.create('api::order.order', {
              data: orderData
            });
            
            writeLog(`Mobile order created successfully with ID: ${createdOrder.id}`);
            
            // Update pending order
            try {
              await strapi.entityService.update('api::pending-order.pending-order', order.id, {
                data: { status: 'completed', paymentId }
              });
              writeLog('Pending order updated to completed');
            } catch (updateError) {
              writeLog(`Error updating pending order: ${updateError.message}`);
            }
            
            // Send notifications
            const cleanPhone = order.customerInfo.phone.replace(/[^0-9]/g, '');
            writeLog(`Sending notifications to: ${cleanPhone}`);
            
            setTimeout(async () => {
              try {
                const smsResponse = await fetch('https://api.dharaniherbbals.com/api/order-sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    data: { mobile: cleanPhone, orderNumber: order.orderNumber, amount: order.total }
                  })
                });
                writeLog(`SMS response status: ${smsResponse.status}`);
              } catch (smsError) {
                writeLog(`SMS error: ${smsError.message}`);
              }
              
              try {
                const whatsappResponse = await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mobile: cleanPhone, orderNumber: order.orderNumber, amount: order.total
                  })
                });
                writeLog(`WhatsApp response status: ${whatsappResponse.status}`);
              } catch (whatsappError) {
                writeLog(`WhatsApp error: ${whatsappError.message}`);
              }
            }, 1000);
            
            writeLog('=== MOBILE ORDER SUCCESS ===');
            ctx.body = { status: 'ok', message: 'Mobile order created' };
            return;
            
          } catch (createError) {
            writeLog(`Mobile order creation failed: ${createError.message}`);
            writeLog(`Error stack: ${createError.stack}`);
            ctx.body = { status: 'error', message: 'Mobile order creation failed' };
            return;
          }
        }
        
        // Website order or fallback
        writeLog('Processing as website order or fallback');
        
        if (pendingOrders.length > 0) {
          // Website order logic here
          writeLog('Website order processing...');
        } else {
          // Fallback for old mobile app
          writeLog('Fallback mobile order processing...');
        }
      }
      
      writeLog('=== WEBHOOK END ===');
      ctx.body = { status: 'ok' };
    } catch (error) {
      writeLog(`WEBHOOK ERROR: ${error.message}`);
      writeLog(`Error stack: ${error.stack}`);
      ctx.body = { status: 'error', message: error.message };
    }
  }
};