import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/forgot-password',
  '/reset-password',
];

// Routes that are always accessible (like static assets, etc.)
const ALWAYS_PUBLIC = [
  '/_next',
  '/favicon.ico',
  '/public',
  '/api/auth/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for always public routes
  if (ALWAYS_PUBLIC.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // API routes handling
  if (pathname.startsWith('/api/')) {
    // Allow auth endpoints without token
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }
    
    // Protect other API routes
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Add token to API request headers if not present
    if (token && !request.headers.get('authorization')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('authorization', `Bearer ${token}`);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    return NextResponse.next();
  }

  // Page routes handling
  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has token and trying to access login page, redirect to root
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};