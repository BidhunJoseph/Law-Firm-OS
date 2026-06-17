'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function loginUser(data: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid credentials' }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError || !authData.user) {
    console.error(`loginUser authError for ${parsed.data.email}:`, authError?.message);
    return { error: authError?.message || 'Invalid login credentials' }
  }

  // Because we boiled the ocean, EVERYONE goes to the Unified OS Dashboard.
  let redirectUrl = '/os/dashboard';

  console.log(`loginUser returning success for ${parsed.data.email} with redirectUrl: ${redirectUrl}`);
  return { success: true, redirectUrl };
}

export async function resetPassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  // Remove the attempt to update requires_password_reset since the DB schema does not have it.
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Just a placeholder if we need to do anything
  }

  redirect('/os/dashboard')
}

export async function logoutUser() {
  if (process.env.NODE_ENV === 'development') {
    const { cookies } = await import('next/headers');
    (await cookies()).delete('mock_user_role');
  }

  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.warn("Supabase Auth unreachable during logout, but local mock cookie was cleared.");
  }
  
  redirect('/')
}
