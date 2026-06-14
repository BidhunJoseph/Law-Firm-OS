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

  // MOCK AUTH BYPASS
  if (!user && process.env.NODE_ENV === 'development') {
    const mockCookie = request.cookies.get('mock_user_role')?.value;
    if (mockCookie) {
      user = { id: 'mock-user-id', email: 'mock@lawfirm.com' } as any;
    }
  }

  const path = request.nextUrl.pathname;
  
  // Only allow explicitly public routes.
  const isPublicRoute = path === '/' || path.startsWith('/api/webhook') || path.endsWith('/login');
  const isResetPasswordRoute = path.startsWith('/reset-password');

  if (!isPublicRoute && !isResetPasswordRoute && !user) {
    // If no user is logged in, route them to their requested context's login or the main homepage
    const url = request.nextUrl.clone()
    if (path.startsWith('/manager')) url.pathname = '/manager/login'
    else if (path.startsWith('/lawyer')) url.pathname = '/lawyer/login'
    else if (path.startsWith('/paralegal')) url.pathname = '/paralegal/login'
    else if (path.startsWith('/client')) url.pathname = '/client/login'
    else url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch profile to check role and requires_password_reset
    const { data: profile } = await supabase
      .from('Profile')
      .select('role, requires_password_reset')
      .eq('id', user.id)
      .single()

    if (profile) {
      if (profile.requires_password_reset && !isResetPasswordRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/reset-password'
        return NextResponse.redirect(url)
      }

      if (!profile.requires_password_reset && isResetPasswordRoute) {
        const url = request.nextUrl.clone()
        const rolePath = profile.role === 'admin' ? '/manager' : `/${profile.role}`
        url.pathname = `${rolePath}/dashboard`
        return NextResponse.redirect(url)
      }

      // Default routing to specific role dashboards
      if ((path.endsWith('/login') || path === '/workspace' || path === '/') && !isResetPasswordRoute) {
        const url = request.nextUrl.clone()
        const rolePath = profile.role === 'admin' ? '/manager' : `/${profile.role}`
        url.pathname = `${rolePath}/dashboard`
        return NextResponse.redirect(url)
      }
      
      // Strict routing: block users from accessing other roles' dashboards
      if (!isResetPasswordRoute) {
        const rolePath = profile.role === 'admin' ? '/manager' : `/${profile.role}`
        
        if (path.startsWith('/manager') && profile.role !== 'admin') {
          const url = request.nextUrl.clone()
          url.pathname = `${rolePath}/dashboard`
          return NextResponse.redirect(url)
        }
        if (path.startsWith('/lawyer') && profile.role !== 'lawyer') {
          const url = request.nextUrl.clone()
          url.pathname = `${rolePath}/dashboard`
          return NextResponse.redirect(url)
        }
        if (path.startsWith('/paralegal') && profile.role !== 'paralegal') {
          const url = request.nextUrl.clone()
          url.pathname = `${rolePath}/dashboard`
          return NextResponse.redirect(url)
        }
        if (path.startsWith('/client') && profile.role !== 'client') {
          const url = request.nextUrl.clone()
          url.pathname = `${rolePath}/dashboard`
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}
