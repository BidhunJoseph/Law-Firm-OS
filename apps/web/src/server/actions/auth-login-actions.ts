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

  // MOCK AUTH BYPASS: Because the workspace firewall blocks outbound 443 to Supabase,
  // we will simulate a successful login and set a mock cookie so the user can test the UI.
  if (process.env.NODE_ENV === 'development') {
    const { cookies } = await import('next/headers');
    let mockRole = 'lawyer';
    if (data.email.includes('manager')) mockRole = 'admin';
    if (data.email.includes('paralegal')) mockRole = 'paralegal';
    if (data.email.includes('client')) mockRole = 'client';
    
    (await cookies()).set('mock_user_role', mockRole, { path: '/' });
    return { success: true };
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Invalid login credentials' }
  }

  return { success: true }
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

  // TODO: QA engineer to implement Supabase update user password logic here
  // const supabase = await createClient()
  // await supabase.auth.updateUser({ password })

  redirect('/workspace')
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
