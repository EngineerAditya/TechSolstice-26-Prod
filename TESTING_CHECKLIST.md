# 🚀 NextAuth Implementation Checklist

## ✅ Completed

- [x] Delete old Supabase auth files
- [x] Create NextAuth API route handler
- [x] Create auth helper library
- [x] Create middleware for route protection
- [x] Create login page with Google OAuth
- [x] Update complete-profile page
- [x] Add SessionProvider to layout
- [x] Update all Server Components to use NextAuth
- [x] Update all Client Components to use NextAuth
- [x] Update all API routes to use NextAuth
- [x] Update hooks to use NextAuth
- [x] Update environment variables template
- [x] Create TypeScript types
- [x] Create setup documentation
- [x] Create database migration SQL

## 📋 Before You Can Test (Required)

### 1. Database Migration
- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `database-migration.sql`
- [ ] Run the SQL script
- [ ] Verify tables updated successfully

### 2. Google OAuth Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create/select project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Client ID
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copy Client ID
- [ ] Copy Client Secret

### 3. Generate NextAuth Secret
- [ ] Open terminal
- [ ] Run: `openssl rand -base64 32`
- [ ] Copy the output

### 4. Update Environment Variables
- [ ] Open `.env.local`
- [ ] Replace `NEXTAUTH_SECRET` with generated secret
- [ ] Replace `GOOGLE_CLIENT_ID` with your Client ID
- [ ] Replace `GOOGLE_CLIENT_SECRET` with your Client Secret
- [ ] Save the file

### 5. Install Dependencies (if needed)
- [ ] Run: `npm install`
- [ ] Verify `next-auth` is installed

### 6. Restart Development Server
- [ ] Stop current dev server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] Wait for server to start

## 🧪 Testing Checklist

### Login Flow
- [ ] Visit `http://localhost:3000/login`
- [ ] Click "Continue with Google"
- [ ] Authenticate with Google
- [ ] Should redirect back to your app
- [ ] Should land on `/complete-profile` (new user)

### Profile Creation
- [ ] Fill in all required fields:
  - [ ] Full Name (should be pre-filled from Google)
  - [ ] Mobile Number (10 digits)
  - [ ] College Name
  - [ ] Registration Number (optional)
- [ ] Click "Complete Profile"
- [ ] Should redirect to `/profile`
- [ ] Should see your profile information

### Protected Routes
- [ ] While logged in, visit `/profile` - should work
- [ ] While logged in, visit `/complete-profile` - should redirect to profile (if complete)
- [ ] Log out
- [ ] Try to visit `/profile` - should redirect to login
- [ ] Try to visit `/admin-dashboard` - should redirect to login

### Admin Access
- [ ] First, get your user_id from the profiles table after logging in:
  ```sql
  SELECT user_id, email FROM profiles WHERE email = 'your@email.com';
  ```
- [ ] Manually add yourself as admin:
  ```sql
  INSERT INTO admins (user_id, email) 
  VALUES ('your-user-id-from-above', 'your@email.com');
  ```
- [ ] Visit `/admin-dashboard` - should now work
- [ ] Try accessing with non-admin user - should redirect to profile

### Sign Out
- [ ] Click "Sign Out" button on profile page
- [ ] Should redirect to home page
- [ ] Try accessing `/profile` - should redirect to login

### Database Verification
- [ ] Check profiles table has entry with TEXT user_id
- [ ] Verify solstice_id was auto-generated
- [ ] Check mobile_number is unique
- [ ] Verify avatar_url is populated from Google

## 🐛 Troubleshooting

### Login Issues
- ❌ **"NEXTAUTH_SECRET is not set"**
  - ✅ Generate with `openssl rand -base64 32`
  - ✅ Add to `.env.local`
  - ✅ Restart server

- ❌ **"Callback URL mismatch"**
  - ✅ Check Google Console redirect URIs
  - ✅ Must match exactly: `http://localhost:3000/api/auth/callback/google`
  - ✅ No trailing slash

- ❌ **Google OAuth error**
  - ✅ Verify Google+ API is enabled
  - ✅ Check Client ID and Secret are correct
  - ✅ Ensure project is not suspended

### Database Issues
- ❌ **"Column 'user_id' does not exist"**
  - ✅ Run `database-migration.sql` script
  - ✅ Verify column renamed from `id` to `user_id`

- ❌ **"Mobile number already exists"**
  - ✅ Normal - enforces uniqueness
  - ✅ Try different mobile number

- ❌ **"Violates foreign key constraint"**
  - ✅ Ensure old auth.users references are removed
  - ✅ Rerun migration script

### Session Issues
- ❌ **Session not persisting**
  - ✅ Check `<Providers>` is in layout.tsx ✅ (done)
  - ✅ Clear browser cookies
  - ✅ Restart dev server

- ❌ **Redirect loop**
  - ✅ Check middleware config ✅ (correct)
  - ✅ Ensure `/api/auth` is excluded ✅ (done)
  - ✅ Clear browser cache

### TypeScript Errors
- ❌ **"Cannot find module next-auth"**
  - ✅ Run `npm install`
  - ✅ Check `package.json` has `next-auth: ^4.24.13`

## 📊 Verification Commands

### Check Database Schema
```sql
-- Verify profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('user_id', 'mobile_number', 'avatar_url');

-- Check if you have any profiles
SELECT user_id, email, full_name, solstice_id 
FROM profiles 
LIMIT 5;
```

### Check Environment Variables
```bash
# In terminal
grep "NEXTAUTH\|GOOGLE" .env.local
```

### Check Server Logs
Watch terminal for:
- ✅ "Ready in XX ms"
- ✅ No error messages
- ❌ Any auth-related errors

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Can click login and see Google OAuth screen
- ✅ After Google auth, redirects to complete-profile
- ✅ Can fill form and submit successfully
- ✅ Profile page shows your information
- ✅ Sign out works and redirects to home
- ✅ Protected routes require authentication
- ✅ Database has entry in profiles table

## 📝 Common Questions

**Q: Why TEXT instead of UUID for user_id?**
A: NextAuth generates string IDs based on provider, not UUIDs.

**Q: Can I keep Supabase for database?**
A: Yes! We only removed Supabase Auth, not the database.

**Q: What about existing users?**
A: They need to re-register. Old UUIDs won't work with NextAuth.

**Q: How do I add more OAuth providers?**
A: Add them to `authOptions.providers` in `/src/app/api/auth/[...nextauth]/route.ts`

**Q: Is JWT secure enough?**
A: Yes! With HttpOnly, Secure, SameSite cookies and 7-day expiry.

## 🆘 Need Help?

1. Check [NEXTAUTH_SETUP.md](./NEXTAUTH_SETUP.md) for detailed setup
2. Check [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) for what changed
3. Review `database-migration.sql` for SQL script
4. Check NextAuth docs: https://next-auth.js.org

## 🎉 Next Steps After Testing Works

- [ ] Test all features thoroughly
- [ ] Setup production Google OAuth credentials
- [ ] Add production redirect URI to Google
- [ ] Deploy to production
- [ ] Update production environment variables
- [ ] Test production login flow
- [ ] Monitor for any issues

---

**Good luck! 🚀**
