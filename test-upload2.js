// Generate a test image
function createTestImage(width = 100, height = 100) {
  const canvas = new Uint8Array(width * height * 4); // RGBA
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = 255;     // R
    canvas[i + 1] = 200; // G
    canvas[i + 2] = 150; // B
    canvas[i + 3] = 255; // A
  }
  return Buffer.from(canvas).toString('base64');
}

// Prepare the request body according to Plant.id API specs
const body = {
  images: [createTestImage()],
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