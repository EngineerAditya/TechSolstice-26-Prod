import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client for database operations only (not auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Get the current session on the server
 * Use this in Server Components and API routes
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user or redirect to login
 * Use this in protected pages
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session || !session.user) {
    redirect('/login')
  }

  return session
}

/**
 * Check if user has completed their profile
 * Returns the profile if complete, null if not
 */
export async function getUserProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return profile
}

/**
 * Check if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .single()

  return !error && !!data
}

/**
 * Require admin access or redirect
 */
export async function requireAdmin() {
  const session = await requireAuth()
  const adminStatus = await isAdmin(session.user.id)

  if (!adminStatus) {
    redirect('/profile')
  }

  return session
}

/**
 * Check if profile is complete
 * Profile is complete if user has all required fields
 */
export function isProfileComplete(profile: any): boolean {
  return !!(
    profile &&
    profile.full_name &&
    profile.mobile_number &&
    profile.college_name
  )
}
