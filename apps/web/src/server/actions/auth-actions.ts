'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { Role } from '@lawfirm/database'

export async function inviteTeamMember(email: string, role: Role) {
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
          name: email.split('@')[0], // Placeholder name
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
