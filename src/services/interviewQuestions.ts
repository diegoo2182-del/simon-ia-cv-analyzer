import Groq from 'groq-sdk';
import { AnalysisResult, JobRequirements, InterviewQuestions } from '@/types/analysis';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Eres un experto en entrevistas técnicas y de competencias con 15 años de experiencia en RRHH.
Tu función es generar preguntas de entrevista personalizadas basadas en el análisis de un CV y una vacante.

REGLAS:
- Generá preguntas específicas al candidato y al rol, NO genéricas.
- Usá las skills detectadas, los gaps y la experiencia real del candidato.
- Las preguntas técnicas deben explorar profundidad y aplicación práctica.
- Las conductuales deben usar el framework STAR (situación, tarea, acción, resultado).
- Las situacionales deben plantear escenarios reales del rol.
- Respondé SIEMPRE con JSON válido, sin texto adicional ni markdown.`;

function buildPrompt(result: AnalysisResult, jobRequirements: JobRequirements): string {
  const { matchingSkills, missingSkills, gaps, skillsBreakdown, categoryScores } = result;
  const { description, seniority } = jobRequirements;

  return `## CONTEXTO DEL ANÁLISIS

**Puesto:** ${seniority}
**Descripción:** ${description}

**Skills que el candidato tiene:** ${matchingSkills.join(', ') || 'ninguna detectada'}
**Skills que le faltan:** ${missingSkills.join(', ') || 'ninguna'}
**Hard skills detectadas:** ${skillsBreakdown.hardSkills.join(', ') || 'ninguna'}
**Soft skills detectadas:** ${skillsBreakdown.softSkills.join(', ') || 'ninguna'}
**Gaps identificados:** ${gaps.join(' | ') || 'ninguno'}
**Score de experiencia:** ${categoryScores.experience}/100
**Score de seniority:** ${categoryScores.seniority}/100

---

## INSTRUCCIÓN
Generá preguntas de entrevista personalizadas y respondé ÚNICAMENTE con este JSON:

{
  "technical": [
    "Pregunta técnica 1 específica a las skills del candidato",
    "Pregunta técnica 2 que explore profundidad en áreas clave",
    "Pregunta técnica 3 que evalúe los gaps detectados",
    "Pregunta técnica 4",
    "Pregunta técnica 5"
  ],
  "behavioral": [
    "Pregunta conductual 1 con formato STAR basada en soft skills detectadas",
    "Pregunta conductual 2 orientada a liderazgo o trabajo en equipo",
    "Pregunta conductual 3 sobre manejo de situaciones desafiantes"
  ],
  "situational": [
    "Pregunta situacional 1 con escenario real del rol",
    "Pregunta situacional 2 que explore cómo manejaría un gap específico",
    "Pregunta situacional 3 sobre decisiones bajo presión o ambigüedad"
  ]
}

Reglas críticas:
- Cada pregunta debe mencionar tecnologías, contextos o situaciones específicas del candidato/rol
- NO usar preguntas genéricas como "¿Cuál es tu mayor fortaleza?"
- Las preguntas técnicas deben nombrar las herramientas o skills concretas del CV
- Las conductuales deben empezar con "Contame sobre...", "Describí una situación..." o similar
- Las situacionales deben empezar con "Imaginá que...", "Si te encontrás con..." o similar`;
}

export async function generateInterviewQuestions(
  result: AnalysisResult,
  jobRequirements: JobRequirements
): Promise<InterviewQuestions> {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.4,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(result, jobRequirements) },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('Groq no devolvió contenido');

  const parsed = JSON.parse(raw);

  if (!parsed.technical || !parsed.behavioral || !parsed.situational) {
    throw new Error('La respuesta de la IA está incompleta');
  }

  return {
    technical: parsed.technical as string[],
    behavioral: parsed.behavioral as string[],
    situational: parsed.situational as string[],
  };
}
