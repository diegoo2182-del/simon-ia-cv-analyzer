import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/services/interviewQuestions';
import { AnalysisResult, JobRequirements, InterviewQuestionsResponse } from '@/types/analysis';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse<InterviewQuestionsResponse>> {
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
