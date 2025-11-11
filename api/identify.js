// Vercel serverless function that proxies requests to Plant.id identification endpoint
// Updated: 2025-11-11

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.PLANT_ID_API_KEY;
  console.log('API Key present:', !!apiKey, 'Length:', apiKey?.length);

  if (!apiKey) {
    console.error('PLANT_ID_API_KEY not found in environment');
    return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
  }

  try {
    console.log('Request body:', JSON.stringify(req.body).substring(0, 200));
    
    const plantIdUrl = 'https://plant.id/api/v3/identification';
    const fetchRes = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    console.log('Plant.id response status:', fetchRes.status);
    const responseText = await fetchRes.text();

    // Try to parse JSON; if not JSON, forward status with diagnostic
    try {
      const data = JSON.parse(responseText);
      console.log('Plant.id response data (truncated):', JSON.stringify(data).substring(0, 200));
      return res.status(fetchRes.ok ? 200 : fetchRes.status).json(data);
    } catch (parseErr) {
      console.warn('Non-JSON response from Plant.id');
      return res.status(fetchRes.status).json({ 
        error: 'Plant.id response not JSON', 
        body: responseText.slice(0, 1000) 
      });
    }
  } catch (err) {
    console.error('Error in /api/identify:', err);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message 
    });
  }
}
