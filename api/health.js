// Vercel-style serverless function that proxies requests to Plant.id health_assessment endpoint

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.PLANT_ID_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });

  try {
    const plantIdUrl = 'https://plant.id/api/v3/health_assessment';
    const fetchRes = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await fetchRes.json();
    return res.status(fetchRes.ok ? 200 : fetchRes.status).json(data);
  } catch (err) {
    console.error('Error in /api/health:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
