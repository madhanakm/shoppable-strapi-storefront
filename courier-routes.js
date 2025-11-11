// src/api/courier/routes/courier.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/courier-booking',
      handler: 'courier.bookCourier',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};