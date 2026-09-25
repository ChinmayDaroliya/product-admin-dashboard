import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

// Runs on the edge before any /products route renders. Checking the cookie
// here (rather than only client-side) means an unauthenticated visitor
// never sees a flash of the dashboard before being redirected - the
// redirect happens before the page is even sent.
export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/products/:path*'],
};
