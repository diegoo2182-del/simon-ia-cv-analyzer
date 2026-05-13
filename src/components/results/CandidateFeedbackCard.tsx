'use client';

import { useState } from 'react';
import { CandidateFeedback, AnalysisResult, JobRequirements } from '@/types/analysis';

interface CandidateFeedbackCardProps {
  analysisResult: AnalysisResult;
  jobRequirements: JobRequirements;
}

interface Section {
  key: keyof CandidateFeedback;
  label: string;
  description: string;
  prefix: string;
  chipMode?: boolean;
  chipClass?: string;
  rowClass: string;
  iconClass: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    key: 'strengths',
    label: 'Fortalezas',
    description: 'Lo que el candidato hace bien',
    prefix: '',
    rowClass: 'text-emerald-700',
    iconClass: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'improvements',
    label: 'Áreas de mejora',
    description: 'Aspectos a desarrollar para el rol',
    prefix: '',
    rowClass: 'text-amber-700',
    iconClass: 'text-amber-500 bg-amber-50 border-amber-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    key: 'recommendedSkills',
    label: 'Skills recomendadas',
    description: 'Para aumentar compatibilidad con el rol',
    prefix: '',
    chipMode: true,
    chipClass: 'bg-purple-50 text-purple-700 border-purple-200',
    rowClass: 'text-purple-700',
    iconClass: 'text-[#7c3aed] bg-purple-50 border-purple-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    key: 'cvTips',
    label: 'Sugerencias para el CV',
    description: 'Cómo presentar mejor el perfil',
    prefix: '',
    rowClass: 'text-blue-700',
    iconClass: 'text-blue-500 bg-blue-50 border-blue-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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

export function CandidateFeedbackCard({ analysisResult, jobRequirements }: CandidateFeedbackCardProps) {
  const [feedback, setFeedback] = useState<CandidateFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/candidate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult, jobRequirements }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Error al generar feedback');
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-blue-400 bg-white p-6">

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-[#1a1a3e]">Feedback para el candidato</h3>
          <p className="text-xs text-slate-400 mt-0.5">Recomendaciones constructivas para mejorar su perfil</p>
        </div>
        {!feedback && (
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
                Generar feedback
              </>
            )}
          </button>
        )}
        {feedback && (
          <button
            onClick={() => { setFeedback(null); setError(null); }}
            className="text-xs text-slate-400 hover:text-[#7c3aed] transition-colors px-2 py-1 rounded hover:bg-purple-50"
          >
            Regenerar
          </button>
        )}
      </div>

      {!feedback && !loading && !error && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="p-3 rounded-full bg-blue-50">
            <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            Generá recomendaciones constructivas para que el candidato mejore su perfil y aumente su compatibilidad con el rol.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">⚠ {error}</div>
      )}

      {feedback && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTIONS.map(({ key, label, description, chipMode, chipClass, rowClass, iconClass, icon }) => {
            const items = feedback[key] as string[];
            if (!items?.length) return null;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg border ${iconClass}`}>{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a3e]">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </div>
                {chipMode ? (
                  <div className="flex flex-wrap gap-2 pl-8">
                    {items.map((item, i) => (
                      <span key={i} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${chipClass}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-1.5 pl-8">
                    {items.map((item, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm leading-relaxed ${rowClass}`}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
