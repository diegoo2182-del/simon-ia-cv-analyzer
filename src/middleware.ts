import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://simon-ia-cv-analyzer.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo aplica a rutas API
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const origin = req.headers.get('origin');

  // Preflight OPTIONS
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

  // Bloquear origen desconocido (solo si viene con origin header — requests del browser)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { success: false, error: 'Origen no permitido.' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
