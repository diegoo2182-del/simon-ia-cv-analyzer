import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session';

const ALLOWED_ORIGINS = [
  'https://simon-ia-cv-analyzer.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas — no requieren auth
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // CORS para rutas API
  if (pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin');

    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 });
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.headers.set('Access-Control-Allow-Origin', origin);
        res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        res.headers.set('Access-Control-Max-Age', '86400');
      }
      return res;
    }

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ success: false, error: 'Origen no permitido.' }, { status: 403 });
    }

    // Auth check para APIs
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    return NextResponse.next();
  }

  // Auth check para páginas
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !verifySessionToken(token)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
