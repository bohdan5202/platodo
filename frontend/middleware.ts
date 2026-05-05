import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('platodo_token')?.value;

  // Define public auth routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register') || 
                      request.nextUrl.pathname.startsWith('/forgot-password') || 
                      request.nextUrl.pathname.startsWith('/reset-password');

  // Define protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/planner') || 
                           request.nextUrl.pathname.startsWith('/alerts');

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access an auth route while logged in, redirect to dashboard
  if (isAuthRoute && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Otherwise, let the request proceed
  return NextResponse.next();
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/planner/:path*',
    '/alerts/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
