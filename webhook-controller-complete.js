const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Use aPanel logs directory
const logFile = '/www/wwwlogs/webhook.log';

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry);
}

module.exports = {
  async razorpay(ctx) {
    try {
      writeLog('=== WEBHOOK TRIGGERED ===');
      
      const { event, payload } = ctx.request.body;
      writeLog(`Event: ${event}`);
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        const orderNumber = payment.notes?.order_number;
        
        writeLog(`Payment ID: ${paymentId}, Order: ${orderNumber}`);
        writeLog(`Payment Notes: ${JSON.stringify(payment.notes)}`);
        
        if (!orderNumber) {
          writeLog('ERROR: No order number found');
          ctx.body = { status: 'ok', message: 'No order number found' };
          return;
        }
        
        // Check if order already exists
        let existingOrder = [];
        try {
          existingOrder = await strapi.entityService.findMany('api::order.order', {
            filters: { 
              $or: [
                { ordernum: orderNumber },
                { remarks: { $contains: paymentId } }
              ]
            }
          });
        } catch (findError) {
          writeLog(`Error finding existing order: ${findError.message}`);
        }
        
        if (existingOrder.length > 0) {
          writeLog(`Order ${orderNumber} already exists`);
          ctx.body = { status: 'ok', message: 'Order already processed' };
          return;
        }
        
        // Find pending order (for website orders)
        let pendingOrders = [];
        try {
          pendingOrders = await strapi.entityService.findMany('api::pending-order.pending-order', {
            filters: {
              $or: [
                { orderNumber: orderNumber },
                { razorpayOrderId: orderId },
                { mobilePaymentRef: paymentId }
              ]
            }
          });
        } catch (pendingError) {
          writeLog(`Error finding pending orders: ${pendingError.message}`);
        }
        
        writeLog(`Pending orders found: ${pendingOrders.length}`);
        
        // MOBILE APP ORDERS (no pending order)
        if (pendingOrders.length === 0) {
          writeLog('Processing mobile app order');
          
          const customerName = payment.notes?.customer_name;
          const customerEmail = payment.notes?.customer_email;
          const customerPhone = payment.notes?.customer_phone;
          const orderTotal = payment.amount / 100;
          
          writeLog(`Mobile Customer: ${customerName}, Email: ${customerEmail}, Phone: ${customerPhone}, Total: ${orderTotal}`);
          
          if (!customerName || !customerEmail || !customerPhone) {
            writeLog('ERROR: Missing mobile customer data');
            ctx.body = { status: 'ok', message: 'Missing customer data' };
            return;
          }
          
          const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          
          try {
            const createdOrder = await strapi.entityService.create('api::order.order', {
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
            
            writeLog(`Mobile order created successfully with ID: ${createdOrder.id}`);
            
            // Send mobile notifications
            const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
            writeLog(`Sending mobile notifications to: ${cleanPhone}`);
            
            // Send mobile notifications
            setTimeout(async () => {
              try {
                const smsResponse = await fetch('https://api.dharaniherbbals.com/api/order-sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    data: { mobile: cleanPhone, orderNumber: orderNumber, amount: orderTotal }
                  })
                });
                const smsResult = await smsResponse.text();
                writeLog(`Mobile SMS response: ${smsResult}`);
              } catch (smsError) {
                writeLog(`Mobile SMS error: ${smsError.message}`);
              }
              
              try {
                const whatsappResponse = await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mobile: cleanPhone, orderNumber: orderNumber, amount: orderTotal
                  })
                });
                const whatsappResult = await whatsappResponse.text();
                writeLog(`Mobile WhatsApp response: ${whatsappResult}`);
              } catch (whatsappError) {
                writeLog(`Mobile WhatsApp error: ${whatsappError.message}`);
              }
            }, 1000);
            
            writeLog('=== MOBILE ORDER COMPLETED ===');
            ctx.body = { status: 'ok', message: 'Mobile order created successfully' };
            return;
            
          } catch (orderError) {
            writeLog(`Mobile order creation failed: ${orderError.message}`);
            ctx.body = { status: 'error', message: 'Mobile order creation failed' };
            return;
          }
        }
        
        // WEBSITE ORDERS (with pending order)
        if (pendingOrders.length > 0) {
          writeLog('Processing website order');
          const order = pendingOrders[0];
          
          const invoiceNumber = `DH${String(Date.now()).slice(-7)}`;
          
          try {
            const createdOrder = await strapi.entityService.create('api::order.order', {
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
                remarks: `Website Payment ID: ${paymentId}`,
                publishedAt: new Date().toISOString()
              }
            });
            
            writeLog(`Website order created successfully with ID: ${createdOrder.id}`);
            
            // Update pending order
            await strapi.entityService.update('api::pending-order.pending-order', order.id, {
              data: { 
                status: 'completed', 
                paymentId,
                completedAt: new Date().toISOString()
              }
            });
            
            writeLog('Pending order updated to completed');
            
            // Send website notifications
            const cleanPhone = order.customerInfo.phone.replace(/[^0-9]/g, '');
            writeLog(`Sending website notifications to: ${cleanPhone}`);
            
            // Send website notifications
            setTimeout(async () => {
              try {
                const smsResponse = await fetch('https://api.dharaniherbbals.com/api/order-sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    data: { mobile: cleanPhone, orderNumber: order.orderNumber, amount: order.total }
                  })
                });
                const smsResult = await smsResponse.text();
                writeLog(`Website SMS response: ${smsResult}`);
              } catch (smsError) {
                writeLog(`Website SMS error: ${smsError.message}`);
              }
              
              try {
                const whatsappResponse = await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mobile: cleanPhone, orderNumber: order.orderNumber, amount: order.total
                  })
                });
                const whatsappResult = await whatsappResponse.text();
                writeLog(`Website WhatsApp response: ${whatsappResult}`);
              } catch (whatsappError) {
                writeLog(`Website WhatsApp error: ${whatsappError.message}`);
              }
            }, 1000);
            
            writeLog('=== WEBSITE ORDER COMPLETED ===');
            ctx.body = { status: 'ok', message: 'Website order created successfully' };
            
          } catch (orderError) {
            writeLog(`Website order creation failed: ${orderError.message}`);
            ctx.body = { status: 'error', message: 'Website order creation failed' };
          }
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      writeLog(`Webhook error: ${error.message}`);
      ctx.body = { status: 'error', message: error.message };
    }
  }
};