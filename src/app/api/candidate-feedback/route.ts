import { NextRequest, NextResponse } from 'next/server';
import { generateCandidateFeedback } from '@/services/candidateFeedback';
import { AnalysisResult, JobRequirements, CandidateFeedbackResponse } from '@/types/analysis';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse<CandidateFeedbackResponse>> {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: 'GROQ_API_KEY no configurada.' }, { status: 500 });
    }

    const { analysisResult, jobRequirements } = await req.json() as {
      analysisResult: AnalysisResult;
      jobRequirements: JobRequirements;
    };

    if (!analysisResult || !jobRequirements) {
      return NextResponse.json({ success: false, error: 'Faltan datos del análisis.' }, { status: 400 });
    }

    const feedback = await generateCandidateFeedback(analysisResult, jobRequirements);
    return NextResponse.json({ success: true, feedback });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[/api/candidate-feedback]', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
