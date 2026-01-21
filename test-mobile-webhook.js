// Test webhook endpoint - add to your Strapi routes
module.exports = {
  async testMobilePayment(ctx) {
    // Simulate mobile app payment with proper notes
    const testPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_' + Date.now(),
            order_id: 'order_test_' + Date.now(),
            amount: 50000, // ₹500
            notes: {
              order_number: 'DH-ECOM-' + Math.floor(Math.random() * 1000),
              customer_name: 'Test Customer',
              customer_email: 'test@example.com',
              customer_phone: '9876543210',
              shipping_address: 'Test Address, Chennai, Tamil Nadu - 600001',
              items: 'Test Product 1, Test Product 2',
              item_details: 'Test Product 1: ₹300 x 1 | Test Product 2: ₹150 x 1',
              shipping_charges: '50',
              total_quantity: '2'
            }
          }
        }
      }
    };

    // Call your webhook
    ctx.request.body = testPayload;
    return await strapi.controller('api::webhook.webhook').razorpay(ctx);
  }
};