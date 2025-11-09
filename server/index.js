// Simple Express proxy for Plant.id API
// Usage: set PLANT_ID_API_KEY in environment and run: node server/index.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.PLANT_ID_API_KEY) {
  console.warn('Warning: PLANT_ID_API_KEY is not set. The server will still start but requests will fail.');
}

app.use(cors({ origin: true }));
app.use(express.json({ limit: '15mb' }));

app.post('/identify', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });

    // Forward the incoming body to Plant.id
    // Expect the client to send JSON with the same shape the frontend used previously, e.g. { images: [base64], details: '...', language: 'en', health: 'all' }
    const plantIdUrl = 'https://api.plant.id/v3/identification';

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await fetchResponse.json();
    if (!fetchResponse.ok) return res.status(fetchResponse.status).json(data);

    return res.json(data);
  } catch (err) {
    console.error('Error in /identify:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/health', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });

    const plantIdUrl = 'https://api.plant.id/v3/health_assessment';
    const fetchResponse = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await fetchResponse.json();
    if (!fetchResponse.ok) return res.status(fetchResponse.status).json(data);

    return res.json(data);
  } catch (err) {
    console.error('Error in /health:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Plant.id proxy listening on port ${PORT}`);
});
