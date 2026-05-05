import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read JWT from cookies (we'll also set it there on login)
  const token = request.cookies.get('platodo_token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Not logged in → redirect to /login (except for public routes)
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // remember where they came from
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → redirect away from login/register to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
