import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/services/fileParser';
import { analyzeCV } from '@/services/groq';
import { JobRequirements, RankingResponse, RankedCandidate } from '@/types/analysis';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest): Promise<NextResponse<RankingResponse>> {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: 'GROQ_API_KEY no configurada.' }, { status: 500 });
    }

    const formData = await req.formData();
    const jobReqsRaw = formData.get('jobRequirements') as string | null;

    if (!jobReqsRaw) {
      return NextResponse.json({ success: false, error: 'Falta la descripción del puesto.' }, { status: 400 });
    }

    let jobRequirements: JobRequirements;
    try {
      jobRequirements = JSON.parse(jobReqsRaw);
    } catch {
      return NextResponse.json({ success: false, error: 'Formato inválido en los requisitos.' }, { status: 400 });
    }

    const cvFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('cv_') && value instanceof File) {
        cvFiles.push(value);
      }
    }

    if (cvFiles.length < 2) {
      return NextResponse.json({ success: false, error: 'Subí al menos 2 CVs para rankear.' }, { status: 400 });
    }

    if (cvFiles.length > MAX_FILES) {
      return NextResponse.json({ success: false, error: `Máximo ${MAX_FILES} CVs por análisis.` }, { status: 400 });
    }

    for (const file of cvFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, error: `Formato no aceptado: ${file.name}` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: `${file.name} supera 10 MB.` }, { status: 400 });
      }
    }

    // Analizar todos los CVs en paralelo
    const results = await Promise.all(
      cvFiles.map(async (file): Promise<RankedCandidate> => {
        const cvText = await extractTextFromFile(file);
        const result = await analyzeCV({ cvText, jobRequirements });
        return { fileName: file.name, result };
      })
    );

    // Ordenar por compatibilityScore descendente
    const sorted = results.sort((a, b) => b.result.compatibilityScore - a.result.compatibilityScore);

    return NextResponse.json({ success: true, candidates: sorted });

  } catch (err) {
    let message = 'Error interno del servidor';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else {
      try { message = JSON.stringify(err); } catch { /* ignore */ }
    }
    console.error('[/api/ranking]', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
