const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'webhook.log');

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
        const paymentId = payment.id;
        const orderNumber = payment.notes?.order_number;
        
        writeLog(`Payment ID: ${paymentId}, Order: ${orderNumber}`);
        writeLog(`Payment Notes: ${JSON.stringify(payment.notes)}`);
        
        if (!orderNumber) {
          writeLog('ERROR: No order number found');
          ctx.body = { status: 'ok', message: 'No order number found' };
          return;
        }
        
        // Extract customer data
        const customerName = payment.notes?.customer_name;
        const customerEmail = payment.notes?.customer_email;
        const customerPhone = payment.notes?.customer_phone;
        const orderTotal = payment.amount / 100;
        
        writeLog(`Customer: ${customerName}, Email: ${customerEmail}, Phone: ${customerPhone}, Total: ${orderTotal}`);
        
        if (!customerName || !customerEmail || !customerPhone) {
          writeLog('ERROR: Missing customer data');
          ctx.body = { status: 'ok', message: 'Missing customer data' };
          return;
        }
        
        // Check if order exists
        const existingOrder = await strapi.entityService.findMany('api::order.order', {
          filters: { ordernum: orderNumber }
        });
        
        if (existingOrder.length > 0) {
          writeLog(`Order ${orderNumber} already exists`);
          ctx.body = { status: 'ok', message: 'Order already processed' };
          return;
        }
        
        writeLog('Creating order...');
        
        // Create order
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
          
          writeLog(`Order created successfully with ID: ${createdOrder.id}`);
          
          // Send notifications
          const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
          writeLog(`Sending notifications to: ${cleanPhone}`);
          
          // SMS
          try {
            const smsResponse = await fetch('https://api.dharaniherbbals.com/api/order-sms', {
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
            writeLog(`SMS response: ${smsResponse.status}`);
          } catch (smsError) {
            writeLog(`SMS error: ${smsError.message}`);
          }
          
          // WhatsApp
          try {
            const whatsappResponse = await fetch('https://api.dharaniherbbals.com/api/whatsapp/send-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mobile: cleanPhone,
                orderNumber: orderNumber,
                amount: orderTotal
              })
            });
            writeLog(`WhatsApp response: ${whatsappResponse.status}`);
          } catch (whatsappError) {
            writeLog(`WhatsApp error: ${whatsappError.message}`);
          }
          
          writeLog('=== WEBHOOK COMPLETED SUCCESSFULLY ===');
          ctx.body = { status: 'ok', message: 'Order created successfully' };
          
        } catch (orderError) {
          writeLog(`Order creation failed: ${orderError.message}`);
          ctx.body = { status: 'error', message: 'Order creation failed' };
        }
      }
      
      ctx.body = { status: 'ok' };
    } catch (error) {
      writeLog(`Webhook error: ${error.message}`);
      ctx.body = { status: 'error', message: error.message };
    }
  }
};