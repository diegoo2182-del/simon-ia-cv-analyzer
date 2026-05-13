import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/services/fileParser';
import { analyzeCV } from '@/services/groq';
import { JobRequirements, AnalyzeResponse } from '@/types/analysis';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY no configurada en el servidor.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const cvFile = formData.get('cv') as File | null;
    const jobReqsRaw = formData.get('jobRequirements') as string | null;

    // Validaciones de entrada
    if (!cvFile || !(cvFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún archivo CV.' },
        { status: 400 }
      );
    }

    if (!ACCEPTED_TYPES.includes(cvFile.type)) {
      return NextResponse.json(
        { success: false, error: 'Solo se aceptan archivos PDF o DOCX.' },
        { status: 400 }
      );
    }

    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo supera el límite de 10 MB.' },
        { status: 400 }
      );
    }

    if (!jobReqsRaw) {
      return NextResponse.json(
        { success: false, error: 'Falta la descripción del puesto.' },
        { status: 400 }
      );
    }

    let jobRequirements: JobRequirements;
    try {
      jobRequirements = JSON.parse(jobReqsRaw);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Formato inválido en los requisitos del puesto.' },
        { status: 400 }
      );
    }

    if (!jobRequirements.description?.trim() || jobRequirements.description.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'La descripción de la vacante es demasiado corta (mínimo 20 caracteres).' },
        { status: 400 }
      );
    }

    // Extracción de texto del CV
    const cvText = await extractTextFromFile(cvFile);

    // Análisis con IA
    const result = await analyzeCV({ cvText, jobRequirements });

    return NextResponse.json({ success: true, result });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor';
    console.error('[/api/analyze]', err);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
