# MirAI - Quick Reference

## API Endpoints (Plant.id)

### Identification Flow
1. **POST** `/identification` → Returns `access_token`
   ```
   POST https://plant.id/api/v3/identification
   Body: { images: ["data:image/jpeg;base64,..."], classification_level: "species", similar_images: true }
   ```

2. **GET** `/identification/:access_token?details=...` → Returns full taxonomy
   ```
   GET https://plant.id/api/v3/identification/:access_token?details=common_names,taxonomy,url,description,rank,synonyms
   ```

### Knowledge Base
3. **GET** `/kb/plants/name_search?q=...` → Search for plant
   ```
   GET https://plant.id/api/v3/kb/plants/name_search?q=aloe vera&limit=1&language=en
   Returns: { entities: [{ access_token: "..." }] }
   ```

4. **GET** `/kb/plants/:access_token?details=...` → Get plant care info
   ```
   GET https://plant.id/api/v3/kb/plants/:access_token?details=edible_parts,watering,propagation_methods
   ```

### Health Assessment
5. **POST** `/health_assessment?details=...` → Get disease/health info
   ```
   POST https://plant.id/api/v3/health_assessment?details=local_name,description,url,treatment,classification,common_names,cause
   Body: { images: ["data:image/jpeg;base64,..."], similar_images: true }
   ```

---

## Backend Endpoints (Your Server)

All endpoints have dual aliases to support both local dev and production:

| Endpoint | Alias | Method | Purpose |
|----------|-------|--------|---------|
| `/identify` | `/api/identify` | POST | Plant identification |
| `/identification-details/:token` | `/api/identification-details/:token` | GET | Full taxonomy details |
| `/plant-search` | `/api/plant-search` | GET | Search knowledge base |
| `/plant-details/:token` | `/api/plant-details/:token` | GET | Plant care information |
| `/health` | `/api/health` | POST | Health assessment |
| `/debug/echo` | - | POST | Test backend connectivity |

---

## Avatar Routing Logic

**File**: `src/pages/Profile.tsx`

```javascript
getAvatarType(plant) {
  const family = plant.plant_information?.taxonomy?.family?.toLowerCase();
  
  if (family.includes('asteraceae')) return 'sunflower';  // Sunny avatar
  if (family.includes('orchidaceae')) return 'orchid';     // Opal avatar
  if (family.includes('cactaceae')) return 'cacti';        // Sage avatar
  // Default for all other plants (including Fabaceae):
  return 'fern';  // Willow avatar
}
```

**Avatar Mapping**:
- **Sunflower** (Sunny) → Asteraceae family (sunflowers, daisies)
- **Orchid** (Opal) → Orchidaceae family (orchids)
- **Cacti** (Sage) → Cactaceae family (cacti, succulents)
- **Fern** (Willow) → Default for all others (ferns, clovers, most plants)

---

## Local Development

### Start Backend
```powershell
$env:PLANT_ID_API_KEY = "9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym"
node server/index.js
```

### Start Frontend
```powershell
npm run dev -- --host
```

### Environment Variables (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=5000
```

---

## Production Deployment

### Vercel (Frontend)
- Environment: `VITE_API_BASE_URL=` (leave empty!)
- Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`
- API calls go to `/api/*` → `vercel.json` rewrites to Railway

### Railway (Backend)
- Environment: `PLANT_ID_API_KEY`
- Environment: `PORT=5000` (auto-set by Railway)
- Start command: `node server/index.js`

### vercel.json
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.railway.app/:path*"
    }
  ]
}
```

---

## Plant Scan Flow (Complete)

1. **User uploads image** → `fileToBase64()` converts to data URL
2. **POST /identify** → Returns `access_token` + basic classification
3. **GET /identification-details/:token** → Returns full taxonomy, common_names, description
4. **GET /plant-search?q=plantName** → Search knowledge base, returns KB `access_token`
5. **GET /plant-details/:token** → Returns edible_parts, watering, propagation_methods
6. **POST /health** → Returns is_healthy, disease suggestions
7. **Merge all data** → Combine identification + details + care + health
8. **Upload to Supabase** → Save image to storage, insert to `usersplants` table
9. **Navigate to DetailedView** → Display all plant information
10. **Profile page** → Show avatar based on taxonomy.family

---

## Debugging Tips

### Check Backend Logs
```powershell
# Backend console shows:
# - "Plant.id proxy listening on port 5000"
# - Request/response logs for each endpoint
# - CORS warnings if origin is blocked
```

### Check Frontend Console
```javascript
// Look for these logs in Scan.tsx:
console.log('Initial identification result:', identification);
console.log('Taxonomy from full identification:', ...);
console.log('Found plant in knowledge base, access_token:', ...);
console.log('Health assessment data:', healthData);

// Look for these logs in Profile.tsx:
console.log('Plant:', plant.plant_name);
console.log('Family:', plant.plant_information?.taxonomy?.family);
console.log('Avatar Type:', avatarType);
```

### Test Individual Endpoints
```bash
# Test backend health
curl http://localhost:5000/debug/echo -X POST -H "Content-Type: application/json" -d '{"test":"hello"}'

# Test identification (requires base64 image)
curl http://localhost:5000/identify -X POST -H "Content-Type: application/json" -d '{"images":["data:image/jpeg;base64,..."]}'
```

---

## Database Schema

**Table**: `usersplants`

```sql
{
  id: bigint (primary key),
  user_id: uuid (foreign key to auth.users),
  plant_path: text (storage path),
  plant_name: text (e.g., "Trifolium repens"),
  scientific_name: text (e.g., "Trifolium repens"),
  species: text (e.g., "Trifolium"),
  overall_health: text (e.g., "Healthy"),
  last_scan_date: date,
  plant_information: jsonb {
    taxonomy: { kingdom, phylum, class, order, family, genus },
    common_names: string[],
    description: string,
    url: string,
    edible_parts: string[] | null,
    watering: object | null,
    propagation_methods: string[] | null
  },
  health_assesment: jsonb {
    is_healthy: { binary, probability },
    is_plant: { binary, probability, threshold },
    disease: { suggestions: [...] },
    question: object | null
  }
}
```

---

## Common Plant Families → Avatars

| Family | Avatar | Name | Example Plants |
|--------|--------|------|----------------|
| Asteraceae | Sunflower | Sunny | Sunflowers, daisies, asters |
| Orchidaceae | Orchid | Opal | Orchids, vanilla |
| Cactaceae | Cacti | Sage | Cacti, prickly pears |
| Fabaceae | Fern | Willow | Clovers, peas, beans |
| Rosaceae | Fern | Willow | Roses, strawberries, apples |
| Solanaceae | Fern | Willow | Tomatoes, peppers, potatoes |
| *Others* | Fern | Willow | Most plants default to fern |

---

## File Structure

```
MirAI/
├── server/
│   └── index.js              # Backend Express server (Railway)
├── src/
│   ├── pages/
│   │   ├── Scan.tsx          # Plant identification page
│   │   ├── Profile.tsx       # Avatar display & plant info
│   │   ├── DetailedView.tsx  # Individual plant details
│   │   └── MyGarden.tsx      # Plant gallery
│   ├── assets/
│   │   └── avatars/          # Avatar images (Sunny, Opal, Sage, Willow)
│   └── supabaseClient.ts     # Supabase configuration
├── .env                      # Local environment variables
├── vercel.json               # Vercel deployment config
├── vite.config.ts            # Vite dev server config
├── DEPLOYMENT_GUIDE.md       # Full deployment instructions
└── README.md                 # Project documentation
```

---

## Next Steps After Deployment

1. **Test plant scanning** on production URL
2. **Verify avatar routing** in Profile page
3. **Check health assessment** no longer returns 502
4. **Monitor Railway logs** for any backend errors
5. **Monitor Vercel logs** for build/runtime issues
6. **Test all endpoints** return 200 status codes
7. **Verify CORS** allows requests from Vercel domain
