import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Просто логуємо, куди йде запит, і пропускаємо його далі
  console.log('Middleware hit:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};