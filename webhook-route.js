// Place this file at: src/api/webhook/routes/webhook.js in your Strapi backend

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/webhooks',
      handler: 'webhook.razorpay',
      config: {
        auth: false,
        middlewares: []
      }
    }
  ]
};