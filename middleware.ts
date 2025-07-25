import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas protegidas
const protectedRoutes = ['/events', '/bets', '/history'];
// Rutas públicas (que no requieren autenticación)
const publicRoutes = ['/login', '/'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt-token');
  const isLoggedIn = Boolean(token?.value);
  const { pathname } = request.nextUrl;

  // Si intenta acceder a una ruta protegida sin login, redirige a /login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si está logueado y accede a /login o raíz, redirige a /events
  if ((pathname === '/login' || pathname === '/') && isLoggedIn) {
    return NextResponse.redirect(new URL('/events', request.url));
  }

  // Si accede a la raíz sin estar logueado, redirige a /login
  if (pathname === '/' && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
