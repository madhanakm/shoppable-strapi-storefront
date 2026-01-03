// src/api/courier/controllers/courier.js
const fetch = require('node-fetch');

module.exports = {
  async bookCourier(ctx) {
    try {
      const ST_COURIER_API_ENDPOINT = 'https://erpstcourier.com/ecom/v2/demobookings.php';
      const ST_COURIER_API_KEY = 'UcTcwSWsZGsl9X0ov84LVOlbWulxfYuT';

      console.log('📦 Courier booking request:', ctx.request.body);
      
      const response = await fetch(ST_COURIER_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'API-TOKEN': ST_COURIER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ctx.request.body)
      });

      const result = await response.json();
      console.log('📦 Courier response:', result);
      
      ctx.body = result;
    } catch (error) {
      console.error('❌ Courier booking error:', error);
      ctx.throw(500, error.message);
    }
  },
};