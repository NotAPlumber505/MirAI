# Supabase Configuration Guide

## Required Supabase Dashboard Settings

### 1. Authentication Redirect URLs

Go to your Supabase project → **Authentication** → **URL Configuration**

Add these URLs to **Redirect URLs** (both local and production):

**Local Development:**
```
http://localhost:5173/reset-password
http://localhost:5173
```

**Production (Vercel):**
```
https://mir-ai.vercel.app/reset-password
https://mir-ai.vercel.app
```

**Site URL:** Set to your production URL
```
https://mir-ai.vercel.app
```

### 2. OAuth Providers (Google)

Go to **Authentication** → **Providers** → **Google**

1. Enable Google provider
2. Add your Google Client ID and Secret
3. **Authorized redirect URIs** in Google Cloud Console should include:
   ```
   https://[your-supabase-project].supabase.co/auth/v1/callback
   ```

### 3. Email Templates

Go to **Authentication** → **Email Templates**

**Confirm signup:**
- Default template is fine

**Reset Password (Magic Link):**
- Template should contain: `{{ .ConfirmationURL }}`
- This URL will automatically include the recovery token as a hash fragment

Example template:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 4. Database Schema

Ensure your `users` table is properly configured:

```sql
create table public.users (
  id uuid not null default auth.uid(),
  created_at timestamp with time zone not null default now(),
  email text not null,
  username text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign key (id) 
    references auth.users (id) 
    on update cascade 
    on delete cascade,
  constraint users_username_check check ((length(username) <= 40))
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Allow users to read their own data
create policy "Users can read own data"
  on public.users
  for select
  using (auth.uid() = id);

-- Allow users to update their own data
create policy "Users can update own data"
  on public.users
  for update
  using (auth.uid() = id);

-- Allow inserting during signup
create policy "Users can insert own data"
  on public.users
  for insert
  with check (auth.uid() = id);
```

---

## How Password Reset Works

### Flow Diagram:
```
1. User clicks "Forgot Password" on /forgot-password
   ↓
2. Enters email → Supabase sends email with reset link
   ↓
3. Email contains link pointing to Supabase's verify endpoint:
   https://[project].supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=http://localhost:5173/reset-password
   ↓
4. User clicks link → Supabase verifies token, then redirects to:
   http://localhost:5173/reset-password#access_token=...&refresh_token=...&type=recovery
   ↓
5. ResetPassword.tsx extracts tokens from hash → Calls supabase.auth.setSession()
   ↓
6. Session created → Shows password reset form
   ↓
7. User submits new password → supabase.auth.updateUser({ password })
   ↓
8. Success → Redirect to /login (or /profile if already logged in)
```

### Important Notes:

1. **Email Link Structure**: The link in the email points to Supabase's verification endpoint (`/auth/v1/verify`) with the redirect URL as a parameter.

2. **Hash Fragments**: After Supabase verifies the token, it redirects to your app with tokens in the URL hash (`#access_token=...&refresh_token=...`).

3. **Session Exchange**: The app extracts these tokens and calls `supabase.auth.setSession()` to create a valid session for password reset.

4. **Change Password from Profile**: Users who are already logged in can navigate directly to /reset-password to change their password, then return to /profile.

5. **Redirect URL**: Must be whitelisted in Supabase dashboard redirect URLs list.

---

## OAuth (Google Sign-In) Configuration

### How Google OAuth Works:

```
1. User clicks "Sign in with Google" on /login
   ↓
2. Frontend calls: supabase.auth.signInWithOAuth({
     provider: 'google',
     options: { redirectTo: window.location.origin }
   })
   ↓
3. User redirected to Google consent screen
   ↓
4. User approves → Google redirects to: 
   https://[supabase-project].supabase.co/auth/v1/callback?code=...
   ↓
5. Supabase processes OAuth → Redirects to window.location.origin
   ↓
6. User logged in → onAuthStateChange fires → Navigate to /
```

### Important:

- `redirectTo: window.location.origin` ensures users stay on the same domain (localhost in dev, vercel.app in production)
- If `redirectTo` is omitted, Supabase uses the **Site URL** from dashboard settings

---

## Testing Checklist

### Local Development (localhost:5173):
- [ ] Google sign-in redirects back to `http://localhost:5173`
- [ ] Forgot password email contains link to `http://localhost:5173/reset-password#access_token=...`
- [ ] Reset password link creates valid session
- [ ] Password update works
- [ ] Redirect to login after password reset

### Production (Vercel):
- [ ] Google sign-in redirects back to `https://mir-ai.vercel.app`
- [ ] Forgot password email contains link to `https://mir-ai.vercel.app/reset-password#access_token=...`
- [ ] Reset password link creates valid session
- [ ] Password update works
- [ ] Redirect to login after password reset

---

## Troubleshooting

### Issue: "Invalid or expired reset link"
- Check that redirect URL is whitelisted in Supabase dashboard
- Verify Site URL is set correctly
- Check browser console for errors
- Try clearing browser cookies/cache

### Issue: Google OAuth redirects to wrong URL
- Verify `window.location.origin` is correct in console
- Check Supabase Site URL setting
- Ensure Google Cloud Console has correct authorized redirect URI

### Issue: Password reset email not arriving
- Check Supabase email logs (Authentication → Email templates → View sent emails)
- Verify email provider settings (Supabase uses built-in SMTP by default)
- Check spam folder

### Issue: "Username constraint violation"
- The `users` table has a constraint: `check ((length(username) <= 40))`
- Changed from 4 to 40 characters to allow normal usernames
- If you see errors, run: `ALTER TABLE public.users DROP CONSTRAINT users_username_check;`
- Then add new constraint: `ALTER TABLE public.users ADD CONSTRAINT users_username_check CHECK ((length(username) <= 40));`

---

## Environment Variables

### Frontend (.env):
```env
VITE_SUPABASE_URL=https://zgwcqmepweybnvezlqsd.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:5000
```

### Vercel (Production):
- `VITE_SUPABASE_URL` → Your Supabase project URL
- `VITE_SUPABASE_KEY` → Your Supabase anon/public key
- `VITE_API_BASE_URL` → Leave empty (uses vercel.json rewrites)

---

## SQL Commands for Setup

### Update username constraint:
```sql
-- Drop old constraint (if it exists)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_check;

-- Add new constraint allowing up to 40 characters
ALTER TABLE public.users 
ADD CONSTRAINT users_username_check 
CHECK ((length(username) <= 40));
```

### Enable RLS and create policies:
```sql
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Create new policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```
