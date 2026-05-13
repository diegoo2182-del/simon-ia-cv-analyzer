'use client';

import { useState, KeyboardEvent } from 'react';
import { JobRequirements, Seniority } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface JobDescriptionFormProps {
  value: JobRequirements;
  onChange: (value: JobRequirements) => void;
}

const SENIORITY_OPTIONS: Seniority[] = ['Junior', 'Semi-Senior', 'Senior', 'Lead', 'Principal'];

function XIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function JobDescriptionForm({ value, onChange }: JobDescriptionFormProps) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || value.requiredSkills.includes(trimmed)) { setSkillInput(''); return; }
    onChange({ ...value, requiredSkills: [...value.requiredSkills, trimmed] });
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    onChange({ ...value, requiredSkills: value.requiredSkills.filter(s => s !== skill) });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
    if (e.key === 'Backspace' && !skillInput && value.requiredSkills.length > 0) {
      removeSkill(value.requiredSkills[value.requiredSkills.length - 1]);
    }
  };

  return (
    <div className="space-y-5">

      {/* Descripción de la vacante */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1a1a3e]">
          Descripción de la vacante
          <span className="text-red-400 ml-1">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Pegá aquí la descripción del puesto: responsabilidades, requisitos, contexto del equipo..."
          value={value.description}
          onChange={e => onChange({ ...value, description: e.target.value })}
          className={cn(
            'w-full rounded-lg border border-[#e8e4f0] bg-white px-4 py-3',
            'text-sm text-[#374151] placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-[#7c3aed]',
            'resize-none transition-colors'
          )}
        />
      </div>

      {/* Skills requeridas */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1a1a3e]">
          Skills requeridas
          <span className="text-slate-400 ml-2 text-xs font-normal">(Enter o coma para agregar)</span>
        </label>

        <div className={cn(
          'min-h-[52px] w-full rounded-lg border border-[#e8e4f0] bg-white px-3 py-2',
          'focus-within:ring-2 focus-within:ring-purple-200 focus-within:border-[#7c3aed]',
          'transition-colors flex flex-wrap gap-2 items-center'
        )}>
          {value.requiredSkills.map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
            >
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                <XIcon />
              </button>
            </span>
          ))}
          <div className="flex-1 flex items-center gap-1 min-w-[140px]">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={value.requiredSkills.length === 0 ? 'ej: Python, SQL, dbt...' : ''}
              className="flex-1 bg-transparent text-sm text-[#374151] placeholder:text-slate-400 focus:outline-none py-0.5"
            />
            {skillInput.trim() && (
              <button
                type="button"
                onClick={addSkill}
                className="shrink-0 p-1 rounded text-[#7c3aed] hover:bg-purple-100 transition-colors"
              >
                <PlusIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seniority */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1a1a3e]">
          Seniority del puesto
          <span className="text-red-400 ml-1">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SENIORITY_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ ...value, seniority: option })}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
                value.seniority === option
                  ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-md shadow-purple-200'
                  : 'bg-white border-[#e8e4f0] text-slate-500 hover:border-[#7c3aed] hover:text-[#7c3aed]'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
