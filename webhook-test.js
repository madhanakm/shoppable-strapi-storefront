// Simple webhook test - run this to check if webhooks are working
// node webhook-test.js

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Test webhook endpoint
app.post('/webhook/razorpay', (req, res) => {
  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Raw Body:', req.rawBody);
  console.log('========================');
  
  res.status(200).json({ status: 'received' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/webhook/razorpay`);
});