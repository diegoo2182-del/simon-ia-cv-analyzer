import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/services/interviewQuestions';
import { AnalysisResult, JobRequirements, InterviewQuestionsResponse } from '@/types/analysis';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse<InterviewQuestionsResponse>> {
  const ip = getClientIP(req);
  const rl = checkRateLimit(ip, 'default');
  if (!rl.allowed) {
    const resetIn = Math.ceil((rl.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      { success: false, error: `Límite de solicitudes alcanzado. Intentá de nuevo en ${resetIn} minutos.` },
      { status: 429 }
    );
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY no configurada en el servidor.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { analysisResult, jobRequirements } = body as {
      analysisResult: AnalysisResult;
      jobRequirements: JobRequirements;
    };

    if (!analysisResult || !jobRequirements) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos del análisis.' },
        { status: 400 }
      );
    }

    const questions = await generateInterviewQuestions(analysisResult, jobRequirements);

    return NextResponse.json({ success: true, questions });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[/api/interview-questions]', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
