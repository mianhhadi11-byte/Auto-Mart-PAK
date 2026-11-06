import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get('mictech_session')?.value;
  if (!token) {
    const login = new URL('/admin/login', request.url);
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
