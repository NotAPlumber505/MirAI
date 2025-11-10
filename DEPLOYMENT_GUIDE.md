# MirAI Deployment Guide

## Architecture Overview

**Frontend**: Deployed on Vercel (React + Vite)  
**Backend**: Deployed on Railway (Node.js Express API)  
**Database**: Supabase (PostgreSQL)  
**Storage**: Supabase Storage (plant images)

---

## Backend Deployment (Railway)

### 1. Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub repository
3. Select the `MirAI` repository
4. Railway will auto-detect Node.js

### 2. Set Environment Variables in Railway
Go to your Railway project → Variables tab and add:

```
PLANT_ID_API_KEY=9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym
PORT=5000
NODE_ENV=production
```

### 3. Configure Start Command
In Railway Settings → Deploy:
- **Root Directory**: `/` (or leave empty)
- **Start Command**: `node server/index.js`

### 4. Get Backend URL
After deployment, Railway will provide a URL like:
```
https://mirai-backend-production.up.railway.app
```

**Save this URL** - you'll need it for the frontend configuration.

---

## Frontend Deployment (Vercel)

### 1. Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Set Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

```
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnd2NxbWVwd2V5Ym52ZXpscXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjUyMjcsImV4cCI6MjA3ODE0MTIyN30._brXJxO3sML91BjtjyBVp5ieULeWJUZuAyQCSbB0nVs
VITE_API_BASE_URL=
```

**Important**: Leave `VITE_API_BASE_URL` **empty** for production. The `vercel.json` file will handle API proxying.

### 3. Update vercel.json
Update the `vercel.json` file with your actual Railway backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-railway-backend-url.railway.app/:path*"
    }
  ]
}
```

Replace `https://your-railway-backend-url.railway.app` with your actual Railway URL from step 4 above.

### 4. Deploy
Vercel will automatically deploy when you push to GitHub.

---

## How API Routing Works

### Local Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API calls use `VITE_API_BASE_URL=http://localhost:5000` to call backend directly

### Production (Deployed)
- Frontend: `https://mir-ai.vercel.app`
- Backend: `https://your-backend.railway.app`
- API calls go to `/api/*` which Vercel rewrites to `https://your-backend.railway.app/*`

### Endpoint Aliases (Both Work)
The backend has dual routes to support both patterns:
- `/identify` and `/api/identify`
- `/health` and `/api/health`
- `/plant-search` and `/api/plant-search`
- `/plant-details/:token` and `/api/plant-details/:token`
- `/identification-details/:token` and `/api/identification-details/:token`

---

## CORS Configuration

The backend (`server/index.js`) is configured to allow:
- `http://localhost:5173` (local dev)
- `https://mir-ai.vercel.app` (production)
- Any `*.vercel.app` domain (preview deployments)

If you change your Vercel domain, update the `allowedOrigins` array in `server/index.js`.

---

## Testing Deployment

### 1. Test Backend Directly
```bash
curl https://your-backend.railway.app/debug/echo \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test":"deployment"}'
```

Expected response: `{"received":{"test":"deployment"}}`

### 2. Test Frontend → Backend
1. Open `https://mir-ai.vercel.app`
2. Login and scan a plant
3. Check browser console for API calls
4. Verify all endpoints return 200 (not 404 or 502)

### 3. Test Plant Identification Flow
1. Upload plant image
2. Verify identification returns taxonomy
3. Check health assessment (should not be 502)
4. Verify plant saves to database
5. Check Profile page shows correct avatar

---

## Common Issues

### Issue: API calls return 404
**Solution**: Check that `vercel.json` rewrites point to correct Railway URL

### Issue: CORS errors
**Solution**: Add your Vercel domain to `allowedOrigins` in `server/index.js`

### Issue: Health assessment returns 502
**Solution**: Verify `PLANT_ID_API_KEY` is set in Railway environment variables

### Issue: Avatar images not showing
**Solution**: Ensure avatar image imports in `Profile.tsx` have correct paths

### Issue: Database connection fails
**Solution**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are set in Vercel

---

## Environment Variables Summary

### Backend (Railway)
- `PLANT_ID_API_KEY`: Your Plant.id API key
- `PORT`: 5000 (Railway sets automatically)

### Frontend (Vercel)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_KEY`: Supabase anon key
- `VITE_API_BASE_URL`: Leave empty (uses vercel.json rewrites)

### Local Development (.env file)
```env
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:5000
PORT=5000
```

**PowerShell (for backend)**:
```powershell
$env:PLANT_ID_API_KEY = "9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym"
node server/index.js
```

---

## Monitoring

### Railway Logs
View backend logs in Railway dashboard → Deployments → Logs

### Vercel Logs
View frontend build/runtime logs in Vercel dashboard → Deployments

### Supabase
Monitor database queries in Supabase dashboard → SQL Editor

---

## Quick Deploy Checklist

- [ ] Railway: Set `PLANT_ID_API_KEY` environment variable
- [ ] Railway: Deploy backend, get URL
- [ ] Vercel: Update `vercel.json` with Railway URL
- [ ] Vercel: Set Supabase environment variables
- [ ] Vercel: Leave `VITE_API_BASE_URL` empty
- [ ] Test: Backend `/debug/echo` endpoint
- [ ] Test: Frontend plant scanning
- [ ] Test: Profile avatar display
- [ ] Verify: No 404/502 errors in browser console
