import Groq from 'groq-sdk';
import { AnalysisResult, JobRequirements, CandidateFeedback } from '@/types/analysis';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Eres un coach de carrera profesional con especialización en tecnología y RRHH.
Tu función es generar feedback constructivo y accionable para candidatos, basado en el análisis de su CV frente a una vacante.

REGLAS:
- Tono: profesional, constructivo, empático. Nunca negativo ni condescendiente.
- Basate únicamente en los datos del análisis, no inventes información.
- El feedback debe ser específico y accionable, no genérico.
- Respondé SIEMPRE con JSON válido, sin texto adicional ni markdown.`;

function buildPrompt(result: AnalysisResult, jobRequirements: JobRequirements): string {
  return `## ANÁLISIS DEL CANDIDATO

**Puesto:** ${jobRequirements.seniority} — ${jobRequirements.description.substring(0, 300)}...

**Skills que coinciden:** ${result.matchingSkills.join(', ') || 'ninguna'}
**Skills faltantes:** ${result.missingSkills.join(', ') || 'ninguna'}
**Hard skills detectadas:** ${result.skillsBreakdown.hardSkills.join(', ') || 'ninguna'}
**Soft skills detectadas:** ${result.skillsBreakdown.softSkills.join(', ') || 'ninguna'}
**Herramientas:** ${result.skillsBreakdown.tools.join(', ') || 'ninguna'}
**Gaps identificados:** ${result.gaps.join(' | ') || 'ninguno'}
**Score de compatibilidad:** ${result.compatibilityScore}/100
**Recomendación:** ${result.recommendation}

---

## INSTRUCCIÓN
Generá feedback constructivo para el candidato y respondé ÚNICAMENTE con este JSON:

{
  "strengths": [
    "Fortaleza específica 1 basada en sus skills y experiencia",
    "Fortaleza 2",
    "Fortaleza 3"
  ],
  "improvements": [
    "Área de mejora concreta 1 — qué desarrollar y por qué",
    "Área de mejora 2"
  ],
  "recommendedSkills": [
    "Skill recomendada 1 para el rol",
    "Skill recomendada 2"
  ],
  "cvTips": [
    "Sugerencia específica para mejorar el CV 1",
    "Sugerencia 2"
  ]
}

Reglas críticas:
- strengths: 2-4 fortalezas reales basadas en skills detectadas
- improvements: 2-3 áreas a desarrollar, siempre en tono positivo ("te recomendamos fortalecer...")
- recommendedSkills: 3-5 skills o certificaciones concretas para el rol (no las que ya tiene)
- cvTips: 2-3 sugerencias de redacción o estructura del CV (detallar proyectos, agregar métricas, etc.)`;
}

export async function generateCandidateFeedback(
  result: AnalysisResult,
  jobRequirements: JobRequirements
): Promise<CandidateFeedback> {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.4,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(result, jobRequirements) },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('Groq no devolvió contenido');

  const parsed = JSON.parse(raw);
  if (!parsed.strengths || !parsed.improvements || !parsed.recommendedSkills || !parsed.cvTips) {
    throw new Error('Respuesta de IA incompleta');
  }

  return parsed as CandidateFeedback;
}
