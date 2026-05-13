'use client';

import { useState } from 'react';
import { InterviewQuestions, AnalysisResult, JobRequirements } from '@/types/analysis';

interface InterviewQuestionsCardProps {
  analysisResult: AnalysisResult;
  jobRequirements: JobRequirements;
}

interface CategoryConfig {
  key: keyof InterviewQuestions;
  label: string;
  description: string;
  chipClass: string;
  numberClass: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'technical',
    label: 'Técnicas',
    description: 'Evaluación de conocimientos y profundidad técnica',
    chipClass: 'bg-purple-50 border-purple-200 text-purple-700',
    numberClass: 'bg-purple-100 text-purple-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    key: 'behavioral',
    label: 'Conductuales',
    description: 'Competencias y comportamientos pasados (STAR)',
    chipClass: 'bg-blue-50 border-blue-200 text-blue-700',
    numberClass: 'bg-blue-100 text-blue-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    key: 'situational',
    label: 'Situacionales',
    description: 'Reacción ante escenarios hipotéticos del rol',
    chipClass: 'bg-amber-50 border-amber-200 text-amber-700',
    numberClass: 'bg-amber-100 text-amber-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
];

function SparklesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

export function InterviewQuestionsCard({ analysisResult, jobRequirements }: InterviewQuestionsCardProps) {
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult, jobRequirements }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Error al generar preguntas');
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-[#7c3aed] bg-white p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-[#1a1a3e]">Preguntas de entrevista</h3>
          <p className="text-xs text-slate-400 mt-0.5">Generadas con IA basadas en el perfil del candidato</p>
        </div>

        {!questions && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-60
              transition-all duration-150 shadow-sm shadow-purple-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generando...
              </>
            ) : (
              <>
                <SparklesIcon />
                Generar preguntas
              </>
            )}
          </button>
        )}

        {questions && (
          <button
            onClick={() => { setQuestions(null); setError(null); }}
            className="text-xs text-slate-400 hover:text-[#7c3aed] transition-colors px-2 py-1 rounded hover:bg-purple-50"
          >
            Regenerar
          </button>
        )}
      </div>

      {/* Estado vacío */}
      {!questions && !loading && !error && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="p-3 rounded-full bg-purple-50">
            <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            Hacé clic en <strong className="text-[#7c3aed]">Generar preguntas</strong> para obtener preguntas personalizadas basadas en el análisis del candidato.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          ⚠ {error}
        </div>
      )}

      {/* Preguntas generadas */}
      {questions && (
        <div className="space-y-6">
          {CATEGORIES.map(({ key, label, description, chipClass, numberClass, icon }) => {
            const list = questions[key];
            if (!list?.length) return null;

            return (
              <div key={key}>
                {/* Label de categoría */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold mb-3 ${chipClass}`}>
                  {icon}
                  {label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${numberClass}`}>
                    {list.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 -mt-1">{description}</p>

                {/* Lista de preguntas */}
                <ol className="space-y-2.5">
                  {list.map((question, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mt-0.5 ${numberClass}`}>
                        {i + 1}
                      </span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
