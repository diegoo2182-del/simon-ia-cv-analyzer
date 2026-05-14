import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword) {
      return NextResponse.json({ success: false, error: 'Servidor mal configurado.' }, { status: 500 });
    }

    if (!password || password !== appPassword) {
      return NextResponse.json({ success: false, error: 'Contraseña incorrecta.' }, { status: 401 });
    }

    const token = createSessionToken();
    const res = NextResponse.json({ success: true });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS / 1000,
      path: '/',
    });

    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Error al procesar la solicitud.' }, { status: 400 });
  }
}
