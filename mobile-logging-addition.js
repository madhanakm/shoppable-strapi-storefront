// Add this logging function at the top of your existing webhook file
const fs = require('fs');

function mobileLog(message) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('/www/wwwlogs/mobile-debug.log', `[${timestamp}] ${message}\n`);
  } catch (e) {}
}

// Add these 3 lines in your existing webhook where mobile order processing happens:

// 1. After getting payment notes:
mobileLog(`Mobile Payment - Order: ${orderNumber}, Notes: ${JSON.stringify(payment.notes)}`);

// 2. After finding pending orders:
mobileLog(`Pending orders found: ${pendingOrders.length}, Communication: ${pendingOrders[0]?.communication}`);

// 3. After order creation attempt:
mobileLog(`Mobile order creation result: ${createdOrder ? 'SUCCESS' : 'FAILED'}`);