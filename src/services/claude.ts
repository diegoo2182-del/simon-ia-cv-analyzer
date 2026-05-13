import Anthropic from '@anthropic-ai/sdk';
import { AnalyzeRequest, AnalysisResult } from '@/types/analysis';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un experto en selección de talento técnico con 15 años de experiencia en RRHH.
Tu única función es analizar CVs y compararlos contra descripciones de puestos de trabajo.

REGLAS ESTRICTAS:
- Usá ÚNICAMENTE la información explícita del CV. No inventes datos ni hagas suposiciones.
- Si una skill no aparece textualmente en el CV, clasificala como faltante.
- Respondé SIEMPRE con JSON válido, sin texto adicional, sin bloques de código markdown.
- El compatibilityScore debe ser un número entero entre 0 y 100.
- recommendation debe ser exactamente uno de: "ADVANCE", "CONSIDER" o "REJECT".
  - ADVANCE: score >= 70 y sin gaps críticos
  - CONSIDER: score entre 45 y 69, o skills importantes faltantes
  - REJECT: score < 45 o gaps fundamentales para el rol`;

function buildUserPrompt(req: AnalyzeRequest): string {
  const { cvText, jobRequirements } = req;
  const { description, requiredSkills, seniority } = jobRequirements;

  const skillsList = requiredSkills.length > 0
    ? requiredSkills.join(', ')
    : 'No se especificaron skills obligatorias';

  return `## CV DEL CANDIDATO
${cvText}

---

## PUESTO A EVALUAR
**Seniority buscado:** ${seniority}

**Skills requeridas:** ${skillsList}

**Descripción del puesto:**
${description}

---

## INSTRUCCIÓN
Analizá el CV contra el puesto y respondé ÚNICAMENTE con este JSON (sin markdown, sin texto extra):

{
  "profileSummary": "Resumen profesional del candidato en 2-3 oraciones basado en su CV",
  "detectedSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "gaps": ["descripción del gap o riesgo identificado"],
  "compatibilityScore": 75,
  "recommendation": "ADVANCE",
  "recommendationReason": "Explicación concisa de 2-3 oraciones justificando la recomendación"
}`;
}

function parseResponse(raw: string): AnalysisResult {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  const required: (keyof AnalysisResult)[] = [
    'profileSummary', 'detectedSkills', 'matchingSkills',
    'missingSkills', 'gaps', 'compatibilityScore',
    'recommendation', 'recommendationReason',
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
  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1500,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(req) },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text' || !block.text) {
    throw new Error('Claude no devolvió contenido en la respuesta');
  }

  return parseResponse(block.text);
}
