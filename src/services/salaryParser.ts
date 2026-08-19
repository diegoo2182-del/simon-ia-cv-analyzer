import Groq from 'groq-sdk';
import { RawCandidate, ParsedSalary } from '@/types/salary';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const BATCH_SIZE = 25;

const SYSTEM_PROMPT = `Eres un normalizador de datos salariales. Tu única función es analizar textos de salario y devolver JSON estructurado.
Reglas:
- "k" = miles (80k = 80000)
- Si viene mensual (month/mensual/Monthly/pm), multiplicar por 12 para anualizar
- Si es rango, usar el punto medio
- Si no hay moneda explícita, inferir por país: USA→USD, India→INR, Pakistan→PKR, Egypt→EGP, Armenia→AMD, Brazil→BRL, Colombia→COP (pero si el número es <200k y candidato LATAM aplica a empresa remota, puede ser USD), Argentina→ARS, Uruguay→UYU, Mexico→MXN, Peru→PEN, Chile→CLP
- Candidatos de LATAM que aplican a roles remotos internacionales frecuentemente cotiza en USD
- Respondé ÚNICAMENTE con JSON válido`;

export async function parseSalaries(candidates: RawCandidate[]): Promise<(ParsedSalary | null)[]> {
  const results: (ParsedSalary | null)[] = new Array(candidates.length).fill(null);
  const batches: number[][] = [];

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    batches.push(Array.from({ length: Math.min(BATCH_SIZE, candidates.length - i) }, (_, j) => i + j));
  }

  await Promise.all(
    batches.map(async (indices) => {
      const batch = indices.map(i => ({
        id: i,
        salary: candidates[i].rawSalary,
        country: candidates[i].country || 'Unknown',
      }));

      const parsed = await parseBatch(batch);
      parsed.forEach((r, j) => { results[indices[j]] = r; });
    }),
  );

  return results;
}

async function parseBatch(
  batch: { id: number; salary: string; country: string }[],
): Promise<(ParsedSalary | null)[]> {
  const prompt = `Analizá estos ${batch.length} registros salariales y devolvé {"results":[...]} con exactamente ${batch.length} objetos.

Cada objeto debe tener:
- id (igual al del input)
- annualAmount (número entero, monto anual en la moneda detectada; null si imposible de parsear)
- currency (código ISO 4217, ej: "USD", "ARS", "INR")
- confidence ("high" si moneda y monto claros, "low" si inferido)

Input:
${JSON.stringify(batch)}`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const arr: { id: number; annualAmount: number | null; currency: string; confidence: string }[] =
      parsed.results ?? parsed.data ?? [];

    return batch.map((entry) => {
      const found = arr.find((r) => r.id === entry.id);
      if (!found || !found.annualAmount) return null;
      return {
        annualAmount: Number(found.annualAmount),
        currency: String(found.currency ?? 'USD').toUpperCase(),
        confidence: found.confidence === 'high' ? 'high' : 'low',
      };
    });
  } catch {
    return batch.map(() => null);
  }
}
