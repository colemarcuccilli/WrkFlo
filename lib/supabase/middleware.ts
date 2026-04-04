import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/project/', '/projects/', '/team', '/settings', '/clients', '/client-dashboard', '/admin']
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Role-based routing for authenticated users
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'creator'

    // Admin accounts can access everything — no redirects
    const ADMIN_EMAILS = ['cole@sweetdreams.us', 'bordeauxcreates@gmail.com']
    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
    if (isAdmin) return supabaseResponse

    // Creator-only pages (clients and viewers get redirected)
    const creatorOnlyPaths = ['/dashboard', '/project/', '/projects/', '/clients', '/team', '/settings']
    const isCreatorPage = creatorOnlyPaths.some((path) => pathname.startsWith(path))

    if ((role === 'client' || role === 'viewer') && isCreatorPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/client-dashboard'
      return NextResponse.redirect(url)
    }

    // Creator accessing client dashboard -> redirect to dashboard
    if (role === 'creator' && pathname.startsWith('/client-dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
