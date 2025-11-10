# 🧪 MirAI Local Testing Checklist

## ✅ Pre-Testing Setup

- [x] Backend running on http://localhost:5000
- [x] Frontend running on http://localhost:5173
- [x] Environment variables configured correctly

## 📋 Manual Testing Steps

### 1. Authentication Flow
- [ ] Open http://localhost:5173 in your browser
- [ ] Register a new account or login
- [ ] Verify redirect to home page after login
- [ ] Check browser console for errors (F12)

### 2. Plant Scanning (Most Important!)
- [ ] Navigate to Scan page
- [ ] Upload a plant image
- [ ] **Check browser Network tab (F12 → Network)**:
  - [ ] Look for POST to `http://localhost:5000/identify`
  - [ ] Status should be `200 OK`
  - [ ] Response should contain plant data
- [ ] Verify plant information displays correctly
- [ ] Check health assessment shows (if available)
- [ ] Click "Upload another?" and test again

### 3. My Garden Page
- [ ] Navigate to My Garden
- [ ] Verify scanned plant appears in the list
- [ ] Check that plant image loads (not placeholder)
- [ ] **Check browser console**:
  - [ ] No Supabase errors
  - [ ] Images load from Supabase storage

### 4. Plant Detail View
- [ ] Click on a plant card in My Garden
- [ ] Verify detailed view loads
- [ ] Check plant image displays correctly
- [ ] Verify all plant information shows:
  - [ ] Scientific classification
  - [ ] Health assessment
  - [ ] Common names
  - [ ] Care information (if available)

### 5. Profile Page
- [ ] Navigate to Profile
- [ ] Verify avatar displays based on plant type
- [ ] Check "Chosen Avatar" section
- [ ] Test "Free This Plant" button
- [ ] Verify plant deletion works

### 6. Theme Toggle
- [ ] Toggle dark/light mode
- [ ] Verify all pages render correctly in both themes
- [ ] Check CSS variables are applied properly

## 🔍 Browser Console Checks

Open Developer Tools (F12) and verify:

### Console Tab
- [ ] No error messages (red text)
- [ ] No CORS errors
- [ ] Supabase connection successful
- [ ] API responses logged correctly

### Network Tab
Filter by "Fetch/XHR" and check:
- [ ] `/identify` → `http://localhost:5000/identify` (Status: 200)
- [ ] `/health` → `http://localhost:5000/health` (Status: 200)
- [ ] `/plant-search` → `http://localhost:5000/plant-search` (Status: 200)
- [ ] `/plant-details` → `http://localhost:5000/plant-details/...` (Status: 200)
- [ ] Supabase requests → `https://zgwcqmepweybnvezlqsd.supabase.co` (Status: 200)

### Application Tab (Storage)
- [ ] Check Local Storage for Supabase session
- [ ] Verify auth token is present

## 🐛 Common Issues & Solutions

### Issue: "Identification failed: no-response"
**Check:**
- Is backend running? (http://localhost:5000/debug/echo)
- Does `.env` have `VITE_API_BASE_URL=http://localhost:5000`?
- Any errors in backend terminal window?

**Fix:**
```powershell
# Restart backend
$env:PLANT_ID_API_KEY = "9W3WT4zIG0Kobo4OmxsiW922UNQWrXW9CkNbWWd74cPu6FCpym"
node server/index.js
```

### Issue: CORS Error
**Check:**
- Look for "CORS" in browser console
- Backend should show allowed origins: `localhost:5173`

**Fix:**
- Already configured in `server/index.js`
- Restart backend if you made changes

### Issue: Images Not Loading
**Check:**
- Are images placeholder or actual plant photos?
- Supabase errors in console?

**Fix:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in `.env`
- Check Supabase Storage permissions (RLS policies)

### Issue: 404 on API Calls
**Check:**
- Network tab shows calls to `http://localhost:5000`?
- Or showing `http://localhost:5173/api/...`?

**Fix:**
- Verify `VITE_API_BASE_URL=http://localhost:5000` in `.env`
- Restart Vite dev server: Ctrl+C, then `npm run dev`

## ✨ Success Criteria

All of these should work:
- ✅ Can scan a plant and see results
- ✅ Plant appears in My Garden with image
- ✅ Can view detailed plant information
- ✅ Profile shows avatars correctly
- ✅ No errors in browser console
- ✅ All API calls go to `localhost:5000`
- ✅ Images load from Supabase storage

## 📝 Next Steps

Once local testing passes:
1. Commit and push changes
2. Follow `DEPLOYMENT.md` for production deployment
3. Test production environment similarly

## 🎯 Quick Test Command

Run this in PowerShell to verify backend:
```powershell
curl.exe http://localhost:5000/debug/echo -X POST -H "Content-Type: application/json" -d '{"test":"hello"}'
```

Expected response:
```json
{"received":{"test":"hello"}}
```
