const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ST_COURIER_API_ENDPOINT = 'https://erpstcourier.com/ecom/v2/demobookings.php';
const ST_COURIER_API_KEY = 'UcTcwSWsZGsl9X0ov84LVOlbWulxfYuT';

app.post('/api/courier-booking', async (req, res) => {
  try {
    console.log('📦 Courier booking request:', req.body);
    
    const response = await fetch(ST_COURIER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'API-TOKEN': ST_COURIER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();
    console.log('📦 Courier response:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Courier booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚚 Courier proxy server running on port ${PORT}`);
});