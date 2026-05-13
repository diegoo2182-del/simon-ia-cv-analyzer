'use client';

import { SkillsBreakdown as SkillsBreakdownType } from '@/types/analysis';

interface SkillsBreakdownProps {
  data: SkillsBreakdownType;
}

interface CategoryConfig {
  key: keyof Omit<SkillsBreakdownType, 'detectedSeniority'>;
  label: string;
  chipClass: string;
  dotClass: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'hardSkills',
    label: 'Hard Skills',
    chipClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    key: 'softSkills',
    label: 'Soft Skills',
    chipClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    key: 'tools',
    label: 'Herramientas',
    chipClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    key: 'languages',
    label: 'Idiomas',
    chipClass: 'bg-teal-50 text-teal-700 border-teal-200',
    dotClass: 'bg-teal-500',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
  },
];

function SeniorityBadge({ seniority }: { seniority: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-400 font-medium">Seniority detectado</span>
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7c3aed] text-white">
        {seniority}
      </span>
    </div>
  );
}

export function SkillsBreakdown({ data }: SkillsBreakdownProps) {
  const hasAnySkill = CATEGORIES.some(cat => (data[cat.key] as string[]).length > 0);

  if (!hasAnySkill && !data.detectedSeniority) return null;

  return (
    <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-[#7c3aed] bg-white p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#1a1a3e]">Perfil de skills del candidato</h3>
        {data.detectedSeniority && (
          <SeniorityBadge seniority={data.detectedSeniority} />
        )}
      </div>

      {/* Categorías */}
      <div className="space-y-4">
        {CATEGORIES.map(({ key, label, chipClass, dotClass, icon }) => {
          const skills = data[key] as string[];
          if (skills.length === 0) return null;

          return (
            <div key={key}>
              {/* Label de categoría */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`p-1 rounded ${chipClass}`}>{icon}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ml-1`} />
                <span className="text-xs text-slate-400">{skills.length}</span>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${chipClass}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
