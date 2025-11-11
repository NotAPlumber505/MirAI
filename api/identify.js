// Vercel-style serverless function that proxies requests to Plant.id identification endpoint
// Deploy this file to Vercel or any serverless platform that supports Node handlers at /api

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.PLANT_ID_API_KEY;
  console.log('API Key present:', !!apiKey, 'Length:', apiKey?.length);

  if (!apiKey) {
    console.error('PLANT_ID_API_KEY not found in environment');
    return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
  }

  // Helper to read raw body if req.body is empty/not parsed
  const readRawBody = () => new Promise((resolve, reject) => {
    try {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });

  try {
    const contentType = req.headers['content-type'] || '';
    let incomingBody = req.body;

    // If body isn't present or is an empty object, try to read raw
    if (!incomingBody || (typeof incomingBody === 'object' && Object.keys(incomingBody).length === 0)) {
      try {
        const raw = await readRawBody();
        if (raw && contentType.includes('application/json')) {
          incomingBody = JSON.parse(raw);
        } else if (raw) {
          incomingBody = raw; // fallback: pass through as-is
        } else {
          incomingBody = {};
        }
      } catch (e) {
        console.warn('Failed to read/parse raw request body:', e);
        incomingBody = incomingBody || {};
      }
    }

    console.log('Request body keys or type:', typeof incomingBody === 'object' ? Object.keys(incomingBody) : typeof incomingBody);

    const plantIdUrl = 'https://plant.id/api/v3/identification';
    const fetchRes = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: typeof incomingBody === 'string' ? incomingBody : JSON.stringify(incomingBody),
    });

    console.log('Plant.id response status:', fetchRes.status);
    const responseText = await fetchRes.text();

    // Try to parse JSON; if not JSON, forward status with diagnostic
    try {
      const data = JSON.parse(responseText);
      console.log('Plant.id response data (truncated):', JSON.stringify(data).substring(0, 200));
      return res.status(fetchRes.ok ? 200 : fetchRes.status).json(data);
    } catch (parseErr) {
      console.warn('Non-JSON response from Plant.id, forwarding text (truncated)');
      return res.status(fetchRes.status).json({ error: 'Plant.id response not JSON', body: responseText.slice(0, 1000) });
    }
  } catch (err) {
    console.error('Error in /api/identify:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
