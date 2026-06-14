'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import type { Role } from '@prisma/client'

export async function inviteTeamMember(name: string, email: string, role: Role, tempPassword?: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify caller is an admin
  const callerProfile = await db.profile.findUnique({
    where: { id: user.id }
  })

  if (!callerProfile || callerProfile.role !== 'admin') {
    throw new Error('Forbidden: Only managers can invite team members')
  }

  // Use Admin API to invite user
  // Supabase best practices say to use app_metadata for authorization
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

  if (error) {
    throw new Error(`Failed to invite user: ${error.message}`)
  }

  // Depending on how you handle user creation, you might rely on a Postgres trigger
  // to insert the profile, or you could create it manually here if it doesn't exist.
  // Note: if doing it manually, ensure you handle conflicts since the trigger might run.
  try {
    if (data.user) {
      await db.profile.upsert({
        where: { id: data.user.id },
        update: {
          role,
          email
        },
        create: {
          id: data.user.id,
          name: name || email.split('@')[0], // Use provided name
          email,
          role,
        }
      })
    }
  } catch (dbError) {
    console.error('Failed to create/update profile record:', dbError)
    // Non-fatal, admin invite succeeded
  }

  return { success: true, user: data.user }
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify caller is an admin
  const callerProfile = await db.profile.findUnique({
    where: { id: user.id }
  })

  if (!callerProfile || callerProfile.role !== 'admin') {
    throw new Error('Forbidden: Only managers can delete team members')
  }

  // Don't allow an admin to delete themselves this way
  if (id === user.id) {
    throw new Error('Cannot delete your own account via this action')
  }

  // Soft Delete: Prevent future logins by banning them for 100 years.
  // We DO NOT hard delete the Profile, as it would destroy historical Case assignments.
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: '876000h' 
  })

  if (error) {
    console.error('Failed to ban auth user:', error)
    throw new Error('Failed to ban user auth')
  }

  // Update their profile name to indicate deactivation (optional visual cue)
  try {
    const p = await db.profile.findUnique({ where: { id } })
    if (p && !p.name.includes('(Deactivated)')) {
      await db.profile.update({
        where: { id },
        data: { name: `${p.name} (Deactivated)` }
      })
    }
  } catch (dbError) {
    console.error('Failed to update profile name:', dbError)
  }

  return { success: true }
}
