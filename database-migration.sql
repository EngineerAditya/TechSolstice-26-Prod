-- ========================================
-- NextAuth Migration SQL Script
-- Run this in your Supabase SQL Editor
-- ========================================

-- STEP 1: Backup existing data (optional but recommended)
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;
-- CREATE TABLE admins_backup AS SELECT * FROM admins;
-- CREATE TABLE teams_backup AS SELECT * FROM teams;
-- CREATE TABLE team_members_backup AS SELECT * FROM team_members;
-- CREATE TABLE user_passes_backup AS SELECT * FROM user_passes;
-- CREATE TABLE query_logs_backup AS SELECT * FROM query_logs;

-- STEP 2: Drop ALL foreign key constraints that reference auth.users or profiles(id)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_id_fkey CASCADE;
ALTER TABLE public.query_logs DROP CONSTRAINT IF EXISTS query_logs_user_id_fkey CASCADE;
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_memberId_fkey CASCADE;
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS Teams_captainId_fkey CASCADE;
ALTER TABLE public.user_passes DROP CONSTRAINT IF EXISTS user_passes_user_id_fkey CASCADE;

-- STEP 3: Update profiles table structure
-- Rename 'id' to 'user_id' and change type to TEXT
ALTER TABLE public.profiles RENAME COLUMN id TO user_id;
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE TEXT;

-- Make some fields optional (NextAuth handles these)
ALTER TABLE public.profiles
  ALTER COLUMN auth_provider DROP NOT NULL,
  ALTER COLUMN is_university_student DROP NOT NULL,
  ALTER COLUMN is_university_student DROP DEFAULT;

-- Recreate primary key
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);

-- Recreate unique constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_mobile_number_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_mobile_number_unique UNIQUE (mobile_number);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_solstice_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_solstice_id_unique UNIQUE (solstice_id);

-- STEP 4: Update admins table structure
ALTER TABLE public.admins RENAME COLUMN id TO user_id;
ALTER TABLE public.admins ALTER COLUMN user_id TYPE TEXT;

-- Recreate primary key
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_pkey CASCADE;
ALTER TABLE public.admins ADD CONSTRAINT admins_pkey PRIMARY KEY (user_id);

-- STEP 5: Update query_logs table (optional - for chatbot query tracking)
-- Change user_id from UUID to TEXT (nullable)
ALTER TABLE IF EXISTS public.query_logs ALTER COLUMN user_id TYPE TEXT;

-- STEP 6: Update teams table
-- Change captain_id from UUID to TEXT
ALTER TABLE public.teams ALTER COLUMN captain_id TYPE TEXT;

-- Recreate foreign key to profiles
ALTER TABLE public.teams 
ADD CONSTRAINT teams_captain_id_fkey 
FOREIGN KEY (captain_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- STEP 7: Update team_members table
-- Change user_id from UUID to TEXT
ALTER TABLE public.team_members ALTER COLUMN user_id TYPE TEXT;

-- Recreate foreign key to profiles
ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- STEP 8: Update user_passes table
-- Change user_id from UUID to TEXT (also remove default gen_random_uuid)
ALTER TABLE public.user_passes ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.user_passes ALTER COLUMN user_id DROP DEFAULT;

-- Recreate foreign key to profiles
ALTER TABLE public.user_passes 
ADD CONSTRAINT user_passes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- STEP 9: Keep your existing solstice_id trigger (random hex generation)
-- Your current trigger generates random 6-char hex IDs like TS-9X2B1A
-- No changes needed to the trigger function

-- STEP 9: Keep your existing solstice_id trigger (random hex generation)
-- Your current trigger generates random 6-char hex IDs like TS-9X2B1A
-- No changes needed to the trigger function

-- STEP 10: Clean up old data (CAUTION: This deletes all user data!)
-- Only uncomment and run this if you want a fresh start with no existing users
-- DELETE FROM public.team_members;
-- DELETE FROM public.teams;
-- DELETE FROM public.user_passes;
-- DELETE FROM public.query_logs WHERE user_id IS NOT NULL;
-- DELETE FROM public.profiles;
-- DELETE FROM public.admins;

-- STEP 11: Update is_admin function (if you have one)
-- This function checks if a user_id exists in the admins table
CREATE OR REPLACE FUNCTION is_admin(uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.admins a WHERE a.user_id = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 12: Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('profiles', 'admins', 'teams', 'team_members', 'user_passes', 'query_logs')
AND column_name IN ('user_id', 'captain_id')
ORDER BY table_name, column_name;

-- Expected output:
-- admins        | user_id     | text | NO
-- profiles      | user_id     | text | NO
-- query_logs    | user_id     | text | YES
-- team_members  | user_id     | text | NO
-- teams         | captain_id  | text | NO
-- user_passes   | user_id     | text | NO

-- ========================================
-- Migration Complete! 
-- ========================================
-- Next steps:
-- 1. Verify all constraints are correct
-- 2. Test creating a new profile via NextAuth
-- 3. Test creating a team
-- 4. Test adding team members
-- 5. Manually add admins to the admins table
-- ========================================
