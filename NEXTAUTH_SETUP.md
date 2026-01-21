# 🔐 NextAuth v4 Implementation - Setup Guide

## ✅ What Has Been Implemented

### **Core Authentication Files**

1. **NextAuth API Route**: `/src/app/api/auth/[...nextauth]/route.ts`
   - Google OAuth provider configured
   - JWT session strategy (stateless)
   - 7-day session expiry
   - Secure callbacks

2. **Auth Library**: `/src/lib/auth.ts`
   - `getSession()` - Get current session
   - `requireAuth()` - Protect pages, redirect if not logged in
   - `getUserProfile()` - Check if profile complete
   - `isAdmin()` - Check admin status
   - `requireAdmin()` - Protect admin routes

3. **Middleware**: `/middleware.ts` at root
   - JWT-based route protection
   - Protects: `/profile`, `/complete-profile`, `/admin-dashboard`, `/passes`
   - Redirects authenticated users away from `/login`

4. **Pages Created**:
   - `/src/app/login/page.tsx` - Google OAuth login
   - `/src/app/complete-profile/page.tsx` - Onboarding form (updated)

5. **Root Layout Updated**: `/src/app/layout.tsx`
   - SessionProvider wrapper added
   - All pages now have access to NextAuth session

6. **TypeScript Types**: `/src/types/next-auth.d.ts`
   - Extended NextAuth types for better TypeScript support

---

## 🗄️ Database Schema Changes Required

### **Step 1: Update Profiles Table**

Your current profiles table references `auth.users` which won't exist anymore. Run this SQL:

```sql
-- Drop old foreign key constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Rename id column to user_id and change type to TEXT
ALTER TABLE public.profiles 
RENAME COLUMN id TO user_id;

ALTER TABLE public.profiles 
ALTER COLUMN user_id TYPE TEXT;

-- Update column structure
ALTER TABLE public.profiles
ALTER COLUMN auth_provider DROP NOT NULL,
ALTER COLUMN is_university_student DROP NOT NULL,
ALTER COLUMN is_university_student DROP DEFAULT;

-- Add avatar_url column if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Recreate unique constraints
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_mobile_number_key;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_mobile_number_unique UNIQUE (mobile_number);

-- Update trigger to use user_id instead of id
-- (Your trigger generate_solstice_id() needs to be updated if it references 'id')
```

### **Step 2: Update Admins Table**

```sql
-- Update admins table structure
ALTER TABLE public.admins
RENAME COLUMN id TO user_id;

ALTER TABLE public.admins
ALTER COLUMN user_id TYPE TEXT;

-- Drop old foreign key
ALTER TABLE public.admins 
DROP CONSTRAINT IF EXISTS admins_id_fkey;

-- Recreate primary key
ALTER TABLE public.admins 
DROP CONSTRAINT IF EXISTS admins_pkey;

ALTER TABLE public.admins
ADD CONSTRAINT admins_pkey PRIMARY KEY (user_id);
```

### **Step 3: Update Existing Data (IF YOU HAVE DATA)**

If you have existing users in your tables, you need to migrate them. This is complex since NextAuth generates new user IDs. 

**Recommended approach**: Fresh start - delete all test data:

```sql
-- CAUTION: This deletes all user data!
DELETE FROM public.profiles;
DELETE FROM public.admins;
DELETE FROM team_members WHERE user_id IN (SELECT user_id FROM profiles);
-- Delete from any other tables that reference profiles
```

### **Step 4: Update Trigger Function**

Update your `generate_solstice_id()` function to use `user_id` instead of `id`:

```sql
CREATE OR REPLACE FUNCTION generate_solstice_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate solstice_id if not provided
    IF NEW.solstice_id IS NULL THEN
        NEW.solstice_id := 'TS26-' || LPAD(nextval('solstice_id_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS set_solstice_id ON profiles;
CREATE TRIGGER set_solstice_id 
BEFORE INSERT ON profiles 
FOR EACH ROW EXECUTE FUNCTION generate_solstice_id();
```

---

## 🔑 Google OAuth Setup

### **Step 1: Create Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret**

### **Step 2: Generate NextAuth Secret**

Run in terminal:
```bash
openssl rand -base64 32
```

### **Step 3: Update `.env.local`**

Replace these values:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste-the-output-from-openssl-command>
GOOGLE_CLIENT_ID=<paste-from-google-console>
GOOGLE_CLIENT_SECRET=<paste-from-google-console>
```

---

## 🚀 Files That Still Need Updates

### **To Be Updated**:
1. `/src/app/profile/page.tsx` - Use `requireAuth()` instead of Supabase
2. `/src/app/admin-dashboard/page.tsx` - Use NextAuth session
3. `/src/app/passes/page.tsx` - Use NextAuth session
4. `/src/app/events/[category]/page.tsx` - Use NextAuth session
5. `/src/app/api/tickets/route.ts` - Use `getSession()` instead of Supabase
6. `/src/components/profile/profile-client.tsx` - Use `signOut()` from next-auth/react
7. `/src/lib/hooks/useUser.ts` - Replace with `useSession()` from next-auth/react
8. Any other components using Supabase auth

---

## 📋 Testing Checklist

### **Before Testing**:
- [ ] Run database schema updates
- [ ] Add Google OAuth credentials to `.env.local`
- [ ] Generate and add `NEXTAUTH_SECRET` to `.env.local`
- [ ] Restart Next.js dev server

### **Test Flow**:
1. [ ] Visit `/login` - Should show Google login button
2. [ ] Click "Continue with Google" - Should redirect to Google
3. [ ] After Google auth - Should redirect back
4. [ ] If new user - Should go to `/complete-profile`
5. [ ] Fill form completely - Should create profile in DB
6. [ ] After profile complete - Should go to `/profile`
7. [ ] Try accessing `/admin-dashboard` - Should redirect if not admin
8. [ ] Sign out - Should clear session and redirect to home

---

## 🔒 Security Features Implemented

✅ **HttpOnly Cookies** - JWT stored securely, not accessible via JavaScript
✅ **Secure Flag** - Cookies only sent over HTTPS in production
✅ **SameSite=Lax** - CSRF protection
✅ **7-day expiry** - Sessions expire automatically
✅ **JWT Signature** - Tokens cryptographically signed and verified
✅ **No DB queries in middleware** - Fast route protection
✅ **No profile insert until complete** - Clean database approach

---

## 📝 Next Steps

1. **Update database schema** (run SQL above)
2. **Setup Google OAuth** (get credentials)
3. **Update .env.local** (add secrets)
4. **Update remaining pages** (profile, admin, etc.)
5. **Test the complete flow**
6. **Deploy and update production env vars**

---

## 🆘 Troubleshooting

**"NEXTAUTH_SECRET is not set"**
→ Generate with `openssl rand -base64 32` and add to `.env.local`

**"Callback URL mismatch"**
→ Make sure Google OAuth callback URLs match exactly

**"Profile not found"**
→ Check if profiles table has `user_id` column (TEXT type)

**"Cannot read session"**
→ Make sure `<Providers>` wrapper is in layout.tsx

**Redirect loop**
→ Check middleware config, ensure `/api/auth` is not matched

---

## 🎯 What's Different from Supabase Auth?

| Feature | Supabase Auth | NextAuth v4 |
|---------|---------------|-------------|
| **User ID** | UUID | String (provider-based) |
| **Session Storage** | Database + Cookie | JWT in Cookie only |
| **OAuth Providers** | Built-in UI | Custom UI needed |
| **Session Check** | Database query | JWT verify (faster) |
| **Logout** | Delete from DB | Clear cookie |
| **Profile Table** | Auto-created | Manual create |

---

Ready to test! Let me know if you hit any issues. 🚀
