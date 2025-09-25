import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUserForMiddleware, isAdminFromToken } from '@/lib/middleware-auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isAdminLoginRoute = path === '/admin/login';

  const user = await getCurrentUserForMiddleware(request);

  // Admin login route
  if (isAdminLoginRoute) {
    if (user && (await isAdminFromToken(request))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect other admin routes
  if (isAdminRoute && (!user || !(await isAdminFromToken(request)))) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
