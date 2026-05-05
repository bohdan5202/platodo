import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get('platodo_token')?.value;
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    // Неавторизований користувач стукає в закритий роут -> на логін
    if (!token && !isPublicRoute) {
      const loginUrl = new URL('/login', request.url);
      
      // Додаткова перевірка, щоб уникнути циклічності
      if (pathname !== '/login') {
         loginUrl.searchParams.set('from', pathname); 
      }
      return NextResponse.redirect(loginUrl);
    }

    // Авторизований користувач стукає в логін/реєстрацію -> на дашборд
    if (token && isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Пропускаємо далі
    return NextResponse.next();
    
  } catch (error) {
    console.error('Proxy execution error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};