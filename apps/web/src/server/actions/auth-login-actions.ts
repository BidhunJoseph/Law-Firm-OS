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
    return { error: authError?.message || 'Invalid login credentials' }
  }

  // Determine Role to auto-route
  const user = authData.user;
  
  try {
    const { db } = await import('@/lib/db');
    const profile = await db.profile.findUnique({
      where: { id: user.id }
    });

    let redirectUrl = '/client/portal'; // Fallback / default
    if (profile) {
      if (profile.role === 'admin') redirectUrl = '/manager/dashboard';
      if (profile.role === 'lawyer') redirectUrl = '/workspace';
      if (profile.role === 'paralegal') redirectUrl = '/paralegal/dashboard';
    } else {
      // If no profile, they might be a client in the Client table, but we default to client portal anyway
      redirectUrl = '/client/portal';
    }

    return { success: true, redirectUrl };
  } catch (err) {
    console.error("Failed to lookup profile role, defaulting to client portal", err);
    return { success: true, redirectUrl: '/client/portal' };
  }
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
