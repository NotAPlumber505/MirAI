// Simple Express proxy for Plant.id API
// Usage: set PLANT_ID_API_KEY in environment and run: node server/index.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Check for API key and explain VITE_ vs non-VITE env vars
if (!process.env.PLANT_ID_API_KEY) {
  if (process.env.VITE_PLANT_ID_API_KEY) {
    console.warn(`
Warning: Found VITE_PLANT_ID_API_KEY but the server needs PLANT_ID_API_KEY (no VITE_ prefix).
In PowerShell, set it with:
$env:PLANT_ID_API_KEY = "${process.env.VITE_PLANT_ID_API_KEY}"
Then restart the server.`);
  } else {
    console.warn('Warning: PLANT_ID_API_KEY is not set. Set it in PowerShell with: $env:PLANT_ID_API_KEY = "your_key_here"');
  }
}

// CORS configuration for local development and production
const allowedOrigins = [
  'http://localhost:5173',           // Vite dev server
  'http://127.0.0.1:5173',           // Alternative localhost
  'http://localhost:5174',           // Alternative Vite port
  'https://mir-ai.vercel.app',       // Production Vercel URL (without trailing slash)
  'https://mirai.vercel.app',        // Alternative production URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel preview deployments
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin?.includes('.vercel.app') ||
                      origin?.includes('localhost');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));

// Helper: ensure images in the forwarded body are valid for Plant.id API.
// Plant.id accepts:
// 1. URLs starting with http:// or https://
// 2. Base64 data URLs in format: data:image/[jpeg|png|...];base64,<base64-string>
// The client (Scan.tsx) already sends properly formatted data URLs, so we just validate them.
function prepareForwardBody(body) {
  try {
    if (!body || !Array.isArray(body.images)) return body;
    
    const images = body.images.map((img, index) => {
      if (typeof img !== 'string') {
        console.warn(`Image ${index} is not a string, skipping validation`);
        return img;
      }
      
      // Check if it's a URL (http:// or https://)
      if (/^https?:\/\//.test(img)) {
        return img;
      }
      
      // Check if it's a proper data URL (data:image/...;base64,...)
      if (/^data:image\/[a-z]+;base64,/.test(img)) {
        return img;
      }
      
      // If it's raw base64 without the data URL prefix, add it
      if (/^[A-Za-z0-9+/=\s]+$/.test(img)) {
        console.log(`Image ${index}: Adding data URL prefix to raw base64 string`);
        return 'data:image/jpeg;base64,' + img.trim();
      }
      
      // If we get here, the format is unexpected
      console.warn(`Image ${index}: Unexpected format, passing through as-is`);
      return img;
    });
    
    return { ...body, images };
  } catch (e) {
    console.warn('prepareForwardBody failed, forwarding original body', e);
    return body;
  }
}

app.post('/identify', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    // Log incoming request briefly for debugging (don't log full API key)
    console.log(`/identify called — body keys: ${Object.keys(req.body).join(', ')}; payload size: ${JSON.stringify(req.body).length} bytes`);

    // Forward the incoming body to Plant.id
  const plantIdUrl = 'https://plant.id/api/v3/identification';

    // DEBUG: log outgoing request info (do not log full API key)
    try {
      console.log(`Forwarding to Plant.id identification endpoint: ${plantIdUrl}`);
      console.log(`Using PLANT_ID_API_KEY length: ${apiKey ? apiKey.length : 0}`);
    } catch (e) {
      console.warn('Failed to log debug info for identification request', e);
    }

    if (typeof fetch !== 'function') {
      console.error('Global fetch is not available in this Node runtime.');
      return res.status(500).json({ error: 'Server runtime missing fetch API' });
    }

    const forwardBody = prepareForwardBody(req.body);
    
    // Log the request we're sending to Plant.id (truncate image data for readability)
    const logBody = {
      ...forwardBody,
      images: forwardBody.images?.map((img, i) => {
        if (typeof img === 'string') {
          const preview = img.substring(0, 100);
          return `Image ${i}: ${preview}... (length: ${img.length})`;
        }
        return img;
      })
    };
    console.log('Forwarding to Plant.id with body:', JSON.stringify(logBody, null, 2));
    console.log('Using API key length:', apiKey ? apiKey.length : 0);

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(forwardBody),
    });

    // Log detailed response info
    console.log('\nPlant.id Response:');
    console.log('Status:', fetchResponse.status);
    console.log('Status Text:', fetchResponse.statusText);
    
    // Log all headers
    console.log('\nResponse Headers:');
    for (const [key, value] of fetchResponse.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Get and log the complete response text (read once, then parse)
    const responseText = await fetchResponse.text();
    console.log('\nResponse Body:', responseText.slice(0, 1000), responseText.length > 1000 ? '...(truncated)' : '');
    
    // Parse the text we already read
    let data;
    try {
      // Try to parse the text as JSON
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Plant.id response:', parseErr);
      console.error('Plant.id response status:', fetchResponse.status, 'body (truncated):', responseText.slice(0, 1000));
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error('Error in /identify:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Vite dev server proxies requests under /api by default, e.g. /api/identify.
// Add alias routes so both /identify and /api/identify work with this proxy.
app.post('/api/identify', async (req, res) => {
  // delegate to same logic used by /identify
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    console.log(`/api/identify called — body keys: ${Object.keys(req.body).join(', ')}; payload size: ${JSON.stringify(req.body).length} bytes`);

    const plantIdUrl = 'https://plant.id/api/v3/identification';

    if (typeof fetch !== 'function') {
      console.error('Global fetch is not available in this Node runtime.');
      return res.status(500).json({ error: 'Server runtime missing fetch API' });
    }

    const forwardBody = prepareForwardBody(req.body);
    const fetchResponse = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(forwardBody),
    });

    // Read response text once
    const responseText = await fetchResponse.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Plant.id response:', parseErr);
      console.error('Plant.id response status:', fetchResponse.status, 'body:', responseText.slice(0, 1000));
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error('Error in /api/identify:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Plant name search endpoint - searches knowledge base by plant name
app.get('/api/plant-search', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const limit = req.query.limit || 10;
    const language = req.query.language || 'en';
    
    const plantIdUrl = `https://plant.id/api/v3/kb/plants/name_search?q=${encodeURIComponent(query)}&limit=${limit}&language=${language}`;

    console.log(`\n=== Plant Search Request ===`);
    console.log(`Query: ${query}`);
    console.log(`URL: ${plantIdUrl}`);

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
      },
    });

    const responseText = await fetchResponse.text();
    console.log('Plant search response status:', fetchResponse.status);
    console.log('Plant search response:', responseText.slice(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from plant search:', parseErr);
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id search returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    console.log('Plant search successful, found', data.entities?.length || 0, 'results');
    return res.json(data);
  } catch (err) {
    console.error('Error in /api/plant-search:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Add non-/api alias for plant-search
app.get('/plant-search', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const limit = req.query.limit || 10;
    const language = req.query.language || 'en';
    
    const plantIdUrl = `https://plant.id/api/v3/kb/plants/name_search?q=${encodeURIComponent(query)}&limit=${limit}&language=${language}`;

    console.log(`\n=== Plant Search Request (non-api route) ===`);
    console.log(`Query: ${query}`);
    console.log(`URL: ${plantIdUrl}`);

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
      },
    });

    const responseText = await fetchResponse.text();
    console.log('Plant search response status:', fetchResponse.status);
    console.log('Plant search response:', responseText.slice(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from plant search:', parseErr);
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id search returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    console.log('Plant search successful, found', data.entities?.length || 0, 'results');
    return res.json(data);
  } catch (err) {
    console.error('Error in /plant-search:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Add non-/api alias for plant-details
app.get('/plant-details/:access_token', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    const { access_token } = req.params;
    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' });
    }

    console.log(`\n=== Plant Details Request (non-api route) ===`);
    console.log(`Access Token: ${access_token}`);

    // Request all available plant details
    const details = 'common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods';
    const language = req.query.language || 'en';
    
    const plantIdUrl = `https://plant.id/api/v3/kb/plants/${access_token}?details=${details}&language=${language}`;

    console.log(`Fetching plant details from: ${plantIdUrl}`);

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
      },
    });

    const responseText = await fetchResponse.text();
    console.log('Plant details response status:', fetchResponse.status);
    console.log('Plant details response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Plant.id plant details:', parseErr);
      console.error('Raw response:', responseText);
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    console.log('Successfully fetched plant details');
    return res.json(data);
  } catch (err) {
    console.error('Error in /plant-details:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Get detailed plant information using access_token from plant search
app.get('/api/plant-details/:access_token', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    const { access_token } = req.params;
    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' });
    }

    console.log(`\n=== Plant Details Request ===`);
    console.log(`Access Token: ${access_token}`);

    // Request all available plant details
    const details = 'common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods';
    const language = req.query.language || 'en';
    
    const plantIdUrl = `https://plant.id/api/v3/kb/plants/${access_token}?details=${details}&language=${language}`;

    console.log(`Fetching plant details from: ${plantIdUrl}`);

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
      },
    });

    const responseText = await fetchResponse.text();
    console.log('Plant details response status:', fetchResponse.status);
    console.log('Plant details response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Plant.id plant details:', parseErr);
      console.error('Raw response:', responseText);
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    console.log('Successfully fetched plant details');
    return res.json(data);
  } catch (err) {
    console.error('Error in /api/plant-details:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Get full identification details using access_token from identification response
app.get('/api/identification-details/:access_token', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    const { access_token } = req.params;
    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' });
    }

    console.log(`\n=== Identification Details Request ===`);
    console.log(`Access Token: ${access_token}`);

    // Request all available identification details including taxonomy
    const details = 'common_names,url,description,taxonomy,rank,gbif_id,synonyms';
    const language = req.query.language || 'en';
    
    const plantIdUrl = `https://plant.id/api/v3/identification/${access_token}?details=${details}&language=${language}`;

    console.log(`Fetching identification details from: ${plantIdUrl}`);

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
      },
    });

    const responseText = await fetchResponse.text();
    console.log('Identification details response status:', fetchResponse.status);
    console.log('Identification details response (first 1000 chars):', responseText.slice(0, 1000));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Plant.id identification details:', parseErr);
      console.error('Raw response:', responseText.slice(0, 1000));
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    console.log('Successfully fetched identification details');
    return res.json(data);
  } catch (err) {
    console.error('Error in /api/identification-details:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Add non-/api alias for direct calls
app.get('/identification-details/:access_token', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
      console.error('PLANT_ID_API_KEY not set');
      return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });
    }

    const { access_token } = req.params;
    if (!access_token) {
      return res.status(400).json({ error: 'access_token is required' });
    }

    console.log(`\n=== Identification Details Request (non-api route) ===`);
    console.log(`Access Token: ${access_token}`);

    // Request all available identification details including taxonomy
    const details = 'common_names,url,description,taxonomy,rank,gbif_id,synonyms';
    const language = req.query.language || 'en';
    
    const plantIdUrl = `https://plant.id/api/v3/identification/${access_token}?details=${details}&language=${language}`;

    console.log(`Fetching identification details from: ${plantIdUrl}`);

    const fetchResponse = await fetch(plantIdUrl, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
      },
    });

    const responseText = await fetchResponse.text();
    console.log('Identification details response status:', fetchResponse.status);
    console.log('Identification details response (first 1000 chars):', responseText.slice(0, 1000));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Plant.id identification details:', parseErr);
      console.error('Raw response:', responseText.slice(0, 1000));
      return res.status(502).json({ error: 'Invalid response from Plant.id', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Plant.id returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    console.log('Successfully fetched identification details');
    return res.json(data);
  } catch (err) {
    console.error('Error in /identification-details:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

app.post('/health', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });

    // Health assessment POST endpoint - details go in URL query string
    const plantIdUrl = 'https://plant.id/api/v3/health_assessment?details=local_name,description,url,treatment,classification,common_names,cause';
    const forwardBody = {
      ...prepareForwardBody(req.body),
      similar_images: true
    };
    
    console.log('Health assessment request URL:', plantIdUrl);
    console.log('Health assessment request body:', JSON.stringify(forwardBody, null, 2));
    
    const fetchResponse = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(forwardBody),
    });

    // Read response as text first to handle parse errors
    const responseText = await fetchResponse.text();
    console.log('Health assessment response status:', fetchResponse.status);
    console.log('Health assessment response body:', responseText.slice(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from health assessment:', parseErr);
      return res.status(502).json({ error: 'Invalid response from Plant.id health assessment', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Health assessment returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error('Error in /health:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Add /api/health alias for Vite proxy
app.post('/api/health', async (req, res) => {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing PLANT_ID_API_KEY' });

    // Health assessment POST endpoint - details go in URL query string
    const plantIdUrl = 'https://plant.id/api/v3/health_assessment?details=local_name,description,url,treatment,classification,common_names,cause';
    const forwardBody = {
      ...prepareForwardBody(req.body),
      similar_images: true
    };
    
    const fetchResponse = await fetch(plantIdUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(forwardBody),
    });

    const responseText = await fetchResponse.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from health assessment:', parseErr);
      return res.status(502).json({ error: 'Invalid response from Plant.id health assessment', body: responseText.slice(0, 1000) });
    }

    if (!fetchResponse.ok) {
      console.error('Health assessment returned error:', fetchResponse.status, data);
      return res.status(fetchResponse.status).json(data);
    }

    return res.json(data);
  } catch (err) {
    console.error('Error in /api/health:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
  }
});

// Debug echo route: useful for local development to inspect the JSON body
// without forwarding to Plant.id (safe, does not call external APIs).
app.post('/debug/echo', (req, res) => {
  try {
    console.log('/debug/echo called — body keys:', Object.keys(req.body).join(', '));
    // Return the received payload so devs can inspect shape and size from the client UI.
    return res.json({ received: req.body });
  } catch (err) {
    console.error('Error in /debug/echo:', err);
    return res.status(500).json({ error: 'Echo failed', detail: String(err) });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Plant.id proxy listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
