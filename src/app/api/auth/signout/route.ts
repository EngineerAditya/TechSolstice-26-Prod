import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Sign out from Supabase
  await supabase.auth.signOut({ scope: 'global' })

  // Revalidate the home page so it shows "Login" instead of "Dashboard"
  revalidatePath('/', 'layout')

  const response = NextResponse.redirect(new URL('/', req.url), {
    status: 302,
  })

  // Clear all auth cookies
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')

  return response
}