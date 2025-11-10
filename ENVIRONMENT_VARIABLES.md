# Environment Variables Configuration

## Overview

Your MirAI app uses different environment variables for **local development** vs **production deployment**. Here's the complete guide.

---

## 🖥️ Local Development

### Frontend (.env.local or .env)
Create a `.env.local` file in the **root directory** (same level as package.json):

```env
# Frontend Environment Variables (Local Development)
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:5000
```

### Backend (PowerShell)
Set the backend API key in PowerShell **before** running the server:

```powershell
# Backend Environment Variable (Local Development)
$env:PLANT_ID_API_KEY = "9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym"

# Then start the backend
cd server
node index.js
```

**Note**: The backend uses `PLANT_ID_API_KEY` (no `VITE_` prefix) because it's server-side only.

---

## ☁️ Production Deployment

### Railway (Backend)

Set these environment variables in your Railway dashboard:

```
PLANT_ID_API_KEY=9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym
PORT=5000
```

**Railway URL**: `https://mirai-production-4610.up.railway.app`

This is your **backend API URL** that the frontend will call in production.

### Vercel (Frontend)

Set these environment variables in your Vercel project settings:

```
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=
```

**Important**: Leave `VITE_API_BASE_URL` **empty** for Vercel production.

The `vercel.json` file handles API routing by rewriting `/api/*` requests to your Railway backend:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://mirai-production-4610.up.railway.app/:path*"
    }
  ]
}
```

---

## 🗄️ Supabase Configuration

### Required Redirect URLs

In your Supabase dashboard → **Authentication** → **URL Configuration**, add these redirect URLs:

**Local Development:**
```
http://localhost:5173
http://localhost:5173/reset-password
```

**Production:**
```
https://mir-ai.vercel.app
https://mir-ai.vercel.app/reset-password
```

**Railway Backend URL:**
```
https://mirai-production-4610.up.railway.app
```

**Note**: You should add your Railway backend URL to Supabase redirect URLs if you plan to use Supabase Auth callbacks from the backend. However, for your current setup (frontend-only auth), the Railway URL is **not required** in Supabase redirect URLs.

### Site URL

Set to your production frontend:
```
https://mir-ai.vercel.app
```

---

## 🔧 How API Routing Works

### Local Development

1. Frontend calls: `http://localhost:5000/api/identify`
2. Request goes directly to your local backend server
3. Backend uses `PLANT_ID_API_KEY` to call Plant.id API

### Production (Vercel + Railway)

1. Frontend calls: `/api/identify` (relative URL)
2. Vercel rewrites to: `https://mirai-production-4610.up.railway.app/identify`
3. Railway backend uses `PLANT_ID_API_KEY` to call Plant.id API

The frontend code uses `VITE_API_BASE_URL` to determine which mode:
- **If set** (local): Use absolute URL `${VITE_API_BASE_URL}/api/identify`
- **If empty** (production): Use relative URL `/api/identify`

---

## 📋 Quick Reference

| Variable | Local Value | Production Value | Where |
|----------|-------------|------------------|-------|
| `PLANT_ID_API_KEY` | `9W3WT...` | `9W3WT...` | Railway |
| `VITE_API_BASE_URL` | `http://localhost:5000` | **(empty)** | Vercel |
| `VITE_SUPABASE_URL` | `https://zgw...supabase.co` | `https://zgw...supabase.co` | Vercel |
| `VITE_SUPABASE_KEY` | `your_anon_key` | `your_anon_key` | Vercel |

---

## ✅ Setup Checklist

### Local Development
- [ ] Create `.env.local` with `VITE_API_BASE_URL=http://localhost:5000`
- [ ] Set PowerShell variable: `$env:PLANT_ID_API_KEY = "9W3WT..."`
- [ ] Run backend: `node server/index.js`
- [ ] Run frontend: `npm run dev`

### Production Deployment
- [ ] Railway: Set `PLANT_ID_API_KEY` environment variable
- [ ] Vercel: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`
- [ ] Vercel: Leave `VITE_API_BASE_URL` **empty**
- [ ] Verify `vercel.json` points to Railway URL
- [ ] Supabase: Add all redirect URLs (local + production)
- [ ] Supabase: Set Site URL to `https://mir-ai.vercel.app`

---

## 🐛 Common Issues

### "Missing API Key" Error
**Problem**: Backend returns 500 with "Server missing PLANT_ID_API_KEY"  
**Solution**: Set `$env:PLANT_ID_API_KEY` in PowerShell (local) or Railway dashboard (production)

### API Calls Failing in Production
**Problem**: 404 or CORS errors on `/api/*` endpoints  
**Solution**: Verify `vercel.json` rewrite destination matches your Railway URL exactly

### Password Reset Redirecting Wrong
**Problem**: Reset link goes to Vercel when testing locally  
**Solution**: Add `http://localhost:5173/reset-password` to Supabase redirect URLs

### OAuth Redirecting to Wrong Domain
**Problem**: Google sign-in redirects to Vercel when on localhost  
**Solution**: Code already uses `window.location.origin` - ensure Supabase redirect URLs include both domains

---

## 🚀 Railway Backend URL

Your Railway backend URL is: `https://mirai-production-4610.up.railway.app`

This URL should be:
1. ✅ Used in `vercel.json` rewrite destination
2. ✅ Set as `VITE_API_BASE_URL` if you want to test production backend locally
3. ❌ **NOT** used as `VITE_API_BASE_URL` in Vercel production (leave empty)
4. ⚠️ **Optional** in Supabase redirect URLs (only if using backend-side auth callbacks)

For your current setup (frontend handles all auth), you **do not need** to add the Railway URL to Supabase redirect URLs.
