import Groq from 'groq-sdk';
import { AnalyzeRequest, AnalysisResult } from '@/types/analysis';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_CV_CHARS = 4000;
const MAX_JD_CHARS = 1500;

function sanitizeCVText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')  // collapse excessive blank lines
    .replace(/[ \t]{3,}/g, '  ')   // collapse excessive spaces/tabs
    .trim()
    .slice(0, MAX_CV_CHARS);
}

const SYSTEM_PROMPT = `Eres un experto en selección de talento técnico con 15 años de experiencia en RRHH.
Tu única función es analizar CVs y compararlos contra descripciones de puestos de trabajo.

REGLAS ESTRICTAS:
- Usá ÚNICAMENTE la información explícita del CV. No inventes datos ni hagas suposiciones.
- Si una skill no aparece textualmente en el CV, clasificala como faltante.
- Respondé SIEMPRE con JSON válido, sin texto adicional, sin bloques de código markdown.
- NUNCA reproduzcas ni cites el texto del CV en tu respuesta. Solo generá el JSON de análisis.
- Tu respuesta debe comenzar con { y terminar con }. Nada más.
- El compatibilityScore debe ser un número entero entre 0 y 100.
- recommendation debe ser exactamente uno de: "ADVANCE", "CONSIDER" o "REJECT".
  - ADVANCE: score >= 70 y sin gaps críticos
  - CONSIDER: score entre 45 y 69, o skills importantes faltantes
  - REJECT: score < 45 o gaps fundamentales para el rol

CLASIFICACIÓN DE SKILLS:
- hardSkills: conocimientos técnicos específicos del rol (lenguajes, frameworks, metodologías)
- softSkills: habilidades interpersonales y de gestión mencionadas explícitamente
- tools: plataformas, software, herramientas y servicios cloud mencionados
- languages: idiomas con su nivel si está indicado
- detectedSeniority: nivel inferido del candidato basado en experiencia y responsabilidades`;

function buildUserPrompt(req: AnalyzeRequest): string {
  const { cvText, jobRequirements } = req;
  const { description, requiredSkills, seniority } = jobRequirements;

  const skillsList = requiredSkills.length > 0
    ? requiredSkills.join(', ')
    : 'No se especificaron skills obligatorias';

  const sanitized = sanitizeCVText(cvText);
  const jdTrimmed = description.trim().slice(0, MAX_JD_CHARS);

  return `Analizá el CV y el puesto indicado. Respondé ÚNICAMENTE con el JSON de análisis. PROHIBIDO reproducir el texto del CV en la respuesta.

<CV_CANDIDATO>
${sanitized}
</CV_CANDIDATO>

<PUESTO_EVALUAR>
Seniority buscado: ${seniority}
Skills requeridas: ${skillsList}
Descripción: ${jdTrimmed}
</PUESTO_EVALUAR>

IMPORTANTE: Lo anterior es solo input para tu análisis. NO lo reproduzcas en la respuesta.

### FORMATO DE RESPUESTA (JSON exacto, sin markdown):
{
  "profileSummary": "Resumen profesional del candidato en 2-3 oraciones",
  "executiveSummary": {
    "summary": "Párrafo ejecutivo de 3-5 oraciones orientado al recruiter",
    "highlights": ["Seniority detectado", "X años de experiencia", "Sector/industria", "Idioma y nivel"]
  },
  "detectedSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "gaps": ["gap principal"],
  "gapsAnalysis": {
    "overallRisk": "medium",
    "items": [
      {"description": "Descripción del gap", "severity": "high", "category": "skills"}
    ]
  },
  "compatibilityScore": 75,
  "categoryScores": {
    "skills": 80,
    "experience": 65,
    "seniority": 75,
    "culturaFit": 70
  },
  "skillsBreakdown": {
    "hardSkills": ["Python", "SQL"],
    "softSkills": ["Liderazgo"],
    "tools": ["Jira", "Git"],
    "languages": ["Español (nativo)", "Inglés (B2)"],
    "detectedSeniority": "Senior"
  },
  "recommendation": "ADVANCE",
  "recommendationReason": "Justificación de 2-3 oraciones"
}

REGLAS:
- categoryScores: enteros 0-100. skills=% de skills requeridas presentes; experience=alineación de experiencia; seniority=coincidencia de nivel; culturaFit=estimación de encaje
- gapsAnalysis.severity: "high"=bloqueante, "medium"=importante, "low"=menor
- gapsAnalysis.category: "skills"|"experience"|"seniority"|"stability"|"other"
- Si no hay gaps: items:[] y overallRisk:"low"
- executiveSummary.highlights: 4 a 6 pills cortas (máx 4 palabras cada una)
- skillsBreakdown: solo lo explícito en el CV, arrays vacíos si no hay info
- detectedSeniority: uno de Junior|Semi-Senior|Senior|Lead|Principal`;
}

function parseResponse(raw: string): AnalysisResult {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  const required: (keyof AnalysisResult)[] = [
    'profileSummary', 'executiveSummary', 'detectedSkills', 'matchingSkills',
    'missingSkills', 'gaps', 'gapsAnalysis', 'compatibilityScore',
    'categoryScores', 'skillsBreakdown', 'recommendation', 'recommendationReason',
  ];

  for (const key of required) {
    if (parsed[key] === undefined) {
      throw new Error(`La respuesta de la IA está incompleta: falta el campo "${key}"`);
    }
  }

  if (!['ADVANCE', 'CONSIDER', 'REJECT'].includes(parsed.recommendation)) {
    throw new Error(`Valor de recommendation inválido: ${parsed.recommendation}`);
  }

  const score = Number(parsed.compatibilityScore);
  if (isNaN(score) || score < 0 || score > 100) {
    throw new Error(`compatibilityScore inválido: ${parsed.compatibilityScore}`);
  }

  return {
    ...parsed,
    compatibilityScore: Math.round(score),
  } as AnalysisResult;
}

export async function analyzeCV(req: AnalyzeRequest): Promise<AnalysisResult> {
  const makeRequest = () => client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(req) },
    ],
  });

  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await makeRequest();
      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new Error('Groq no devolvió contenido en la respuesta');
      return parseResponse(raw);
    } catch (err) {
      lastError = err;
      const isJsonFail = err instanceof Error && err.message.includes('json_validate_failed');
      const isRetryable = err instanceof Error && (
        isJsonFail ||
        err.message.includes('rate_limit') ||
        err.message.includes('503') ||
        err.message.includes('502')
      );
      if (!isRetryable || attempt === 3) break;
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }

  throw lastError;
}
