'use server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function getClientDocumentRequests() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // We are assuming this function is for clients. If they are staff, maybe it returns relevant ones.
  // Wait, let's fetch profile first.
  const profile = await db.profile.findUnique({
    where: { id: user.id }
  })

  if (profile) {
    if (profile.role === 'admin') {
      return await db.documentRequest.findMany({
        include: { case: true },
        orderBy: { created_at: 'desc' }
      })
    }
    
    // For lawyers/paralegals, get document requests for cases they manage
    return await db.documentRequest.findMany({
      where: {
        case: {
          OR: [
            { lawyer_id: user.id },
            { paralegal_id: user.id }
          ]
        }
      },
      include: { case: true },
      orderBy: { created_at: 'desc' }
    })
  }

  // If no profile, check if they are a Client
  const client = await db.client.findUnique({
    where: { id: user.id }
  })

  if (!client) {
    throw new Error('Unauthorized')
  }

  // They are a client, return their document requests
  return await db.documentRequest.findMany({
    where: {
      case: {
        client_id: user.id
      }
    },
    include: { case: true },
    orderBy: { created_at: 'desc' }
  })
}
