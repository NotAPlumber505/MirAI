import { readFileSync } from 'fs';

// Use a small test image data URL (1x1 pixel transparent PNG)
const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Prepare the request body according to Plant.id API specs
const body = {
  api_key: process.env.PLANT_ID_API_KEY, // API key will be added by the server
  images: [base64Image],
  modifiers: ["similar_images"],
  plant_details: ["common_names", "url", "description", "taxonomy", "rank"],
  plant_language: "en",
  disease_details: ["description", "treatment"]
};

// Test the identify endpoint
fetch('http://localhost:5000/identify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
})
.then(resp => resp.json())
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error('Error:', err);
});