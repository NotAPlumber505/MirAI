# MirAI Deployment Guide

This guide explains how to deploy MirAI with a Vercel frontend and Railway backend.

## Architecture

- **Frontend**: React + Vite hosted on Vercel
- **Backend**: Node.js + Express hosted on Railway
- **Database & Storage**: Supabase (hosted)

## Environment Variables

### Local Development (.env)

```env
# Plant.id API
VITE_PLANT_ID_API_KEY=9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym

# Supabase
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend
PORT=5000
VITE_API_BASE_URL=http://localhost:5000
```

### Railway (Backend) Environment Variables

```env
PLANT_ID_API_KEY=9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym
PORT=5000
```

**Important**: Railway uses `PLANT_ID_API_KEY` (without `VITE_` prefix) because it's a server-side variable.

### Vercel (Frontend) Environment Variables

```env
VITE_PLANT_ID_API_KEY=9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://mirai-production-4610.up.railway.app
```

**Critical**: `VITE_API_BASE_URL` must point to your Railway backend URL.

## CORS Configuration

The backend (`server/index.js`) is configured to allow requests from:

- `http://localhost:5173` (local Vite dev server)
- `http://127.0.0.1:5173` (alternative localhost)
- `https://mirai-tau.vercel.app` (production - **update with your actual Vercel domain**)

### Update CORS for Your Domain

In `server/index.js`, update the `allowedOrigins` array:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://your-actual-domain.vercel.app',  // <-- Change this
];
```

## How It Works

### API Routing

The frontend uses `VITE_API_BASE_URL` to determine which backend to call:

- **Local**: `http://localhost:5000` → calls local Express server
- **Production**: `https://mirai-production-4610.up.railway.app` → calls Railway backend

The `Scan.tsx` component has a smart fallback system:
1. Tries the URL from `VITE_API_BASE_URL`
2. If that fails and we're in dev mode, falls back to `localhost:5000`

### Image Storage

All plant images are stored in Supabase Storage:
- Uses signed URLs with 60-second expiration
- Works identically in local and production environments
- Configured in `DetailedView.tsx` and `MyGarden.tsx`

## Deployment Steps

### 1. Deploy Backend to Railway

1. Connect your GitHub repo to Railway
2. Set environment variables:
   - `PLANT_ID_API_KEY`
   - `PORT=5000`
3. Railway will auto-detect the Node.js project
4. Deploy and note your Railway URL (e.g., `https://mirai-production-4610.up.railway.app`)

### 2. Deploy Frontend to Vercel

1. Connect your GitHub repo to Vercel
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Add environment variables:
   - `VITE_PLANT_ID_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
   - `VITE_API_BASE_URL` (use your Railway URL)
5. Deploy

### 3. Update CORS

After deploying to Vercel, update `server/index.js` with your actual Vercel domain, commit, and redeploy Railway.

## Testing

### Local Testing

1. Start backend: `node server/index.js`
2. Start frontend: `npm run dev`
3. Test plant scanning and image viewing

### Production Testing

1. Visit your Vercel URL
2. Test all features:
   - Login/Register
   - Plant scanning
   - Viewing plant details
   - Avatar display

## Troubleshooting

### 404 Errors on API Calls

- **Symptom**: Scan page returns 404
- **Fix**: Verify `VITE_API_BASE_URL` is set correctly in Vercel
- **Check**: Look at browser Network tab to see which URL is being called

### CORS Errors

- **Symptom**: "Not allowed by CORS" in browser console
- **Fix**: Add your Vercel domain to `allowedOrigins` in `server/index.js`

### Images Not Loading

- **Symptom**: Placeholder images instead of plant photos
- **Fix**: Check Supabase Storage permissions and RLS policies
- **Verify**: Signed URLs are being generated (check browser console)

### Profile/DetailedView Crashes

- **Symptom**: Page crashes or shows errors
- **Fix**: Ensure Supabase credentials are correct in Vercel env vars
- **Check**: Browser console for Supabase auth errors

## Local Development Commands

```bash
# Install dependencies
npm install

# Run backend (in one terminal)
$env:PLANT_ID_API_KEY = "your_key_here"
node server/index.js

# Run frontend (in another terminal)
npm run dev
```

## Production URLs

- **Frontend**: https://your-domain.vercel.app
- **Backend**: https://mirai-production-4610.up.railway.app
- **Database**: https://zgwcqmepweybnvezlqsd.supabase.co

## Security Notes

- Never commit `.env` files to Git
- Plant.id API key is only exposed to Railway backend (not in frontend bundle)
- Supabase keys are client-safe (anon key with RLS)
- CORS restricts backend access to authorized domains only
