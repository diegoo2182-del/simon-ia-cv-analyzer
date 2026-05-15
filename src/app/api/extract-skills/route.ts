import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = checkRateLimit(ip, 'default');
  if (!rl.allowed) {
    const resetIn = Math.ceil((rl.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      { success: false, error: `Límite alcanzado. Intentá en ${resetIn} minutos.` },
      { status: 429 }
    );
  }

  try {
    const { description } = await req.json();
    if (!description?.trim() || description.trim().length < 20) {
      return NextResponse.json({ success: false, error: 'La descripción es demasiado corta.' }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Extraé las skills técnicas y profesionales clave de una descripción de puesto. Respondé SOLO con JSON: {"skills": ["skill1", "skill2", ...]}. Máximo 12 skills. Sin duplicados. Nombres cortos y precisos.',
        },
        {
          role: 'user',
          content: description.slice(0, 2000),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const skills: string[] = Array.isArray(parsed.skills) ? parsed.skills.slice(0, 12) : [];

    return NextResponse.json({ success: true, skills });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al extraer skills';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
