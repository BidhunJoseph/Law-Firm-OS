import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies.

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies.

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.warn("Supabase Auth unreachable in middleware. Assuming unauthenticated or development fallback.");
  }



  const path = request.nextUrl.pathname;
  
  // Only allow explicitly public routes.
  const isPublicRoute = path === '/' || path.startsWith('/api/webhook') || path.endsWith('/login');
  const isResetPasswordRoute = path.startsWith('/reset-password');

  if (!isPublicRoute && !isResetPasswordRoute && !user) {
    // If no user is logged in, route them to the main homepage (login)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch profile to check role
    const { data: profile } = await supabase
      .from('Profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {

      // Unified routing to the OS Dashboard
      if ((path.endsWith('/login') || path === '/workspace' || path === '/') && !isResetPasswordRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/os/dashboard'
        return NextResponse.redirect(url)
      }
      
      // Prevent access to old routes
      if (!isResetPasswordRoute && (path.startsWith('/manager') || path.startsWith('/lawyer') || path.startsWith('/paralegal') || path.startsWith('/client'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/os/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
