'use client';

import { Badge } from '@/components/ui/Badge';

interface SkillsGridProps {
  detectedSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
}

function SectionTitle({ icon, label, count, color }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-[#1a1a3e]">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
        {count}
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="w-4 h-4 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

export function SkillsGrid({ detectedSkills, matchingSkills, missingSkills }: SkillsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-[#7c3aed] bg-white p-5">
        <SectionTitle
          icon={<TagIcon />}
          label="Skills detectadas"
          count={detectedSkills.length}
          color="bg-purple-100 text-purple-700"
        />
        {detectedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map(skill => <Badge key={skill} variant="info">{skill}</Badge>)}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No se detectaron skills</p>
        )}
      </div>

      <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-emerald-500 bg-white p-5">
        <SectionTitle
          icon={<CheckIcon />}
          label="Coincidencias"
          count={matchingSkills.length}
          color="bg-emerald-50 text-emerald-700"
        />
        {matchingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchingSkills.map(skill => <Badge key={skill} variant="success">{skill}</Badge>)}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Sin coincidencias directas</p>
        )}
      </div>

      <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-red-500 bg-white p-5">
        <SectionTitle
          icon={<XCircleIcon />}
          label="Skills faltantes"
          count={missingSkills.length}
          color="bg-red-50 text-red-700"
        />
        {missingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map(skill => <Badge key={skill} variant="danger">{skill}</Badge>)}
          </div>
        ) : (
          <p className="text-xs text-emerald-600 italic font-medium">¡Sin skills faltantes!</p>
        )}
      </div>

    </div>
  );
}
