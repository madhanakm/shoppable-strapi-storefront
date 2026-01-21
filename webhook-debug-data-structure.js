// Add this debug logging to webhook before order creation

console.log('=== DEBUG: Pending Order Structure ===');
console.log('Raw order:', JSON.stringify(order, null, 2));
console.log('Order keys:', Object.keys(order));
console.log('Has attributes?', !!order.attributes);
console.log('OrderData after processing:', JSON.stringify(orderData, null, 2));

// Validate each required field
const validationErrors = [];
if (!orderData.orderNumber) validationErrors.push('Missing orderNumber');
if (!orderData.customerInfo) validationErrors.push('Missing customerInfo');
if (!orderData.customerInfo?.name) validationErrors.push('Missing customer name');
if (!orderData.customerInfo?.phone) validationErrors.push('Missing customer phone');
if (!orderData.customerInfo?.address) validationErrors.push('Missing customer address');
if (!orderData.total) validationErrors.push('Missing total amount');

if (validationErrors.length > 0) {
  console.log('=== VALIDATION ERRORS ===');
  console.log('Errors:', validationErrors);
  console.log('CustomerInfo structure:', JSON.stringify(orderData.customerInfo, null, 2));
  return;
}

console.log('=== All validations passed ===');