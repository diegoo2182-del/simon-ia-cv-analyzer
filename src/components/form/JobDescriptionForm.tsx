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

function SparklesIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

export function JobDescriptionForm({ value, onChange }: JobDescriptionFormProps) {
  const [skillInput, setSkillInput] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

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

  const handleExtractSkills = async () => {
    if (!value.description.trim() || value.description.trim().length < 20) {
      setExtractError('Primero pegá la descripción del puesto.');
      return;
    }
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch('/api/extract-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: value.description }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setExtractError(data.error ?? 'Error al detectar skills');
        return;
      }
      // Merge sin duplicados
      const merged = [...new Set([...value.requiredSkills, ...data.skills])];
      onChange({ ...value, requiredSkills: merged });
    } catch {
      setExtractError('Error de conexión. Intentá de nuevo.');
    } finally {
      setExtracting(false);
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
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[#1a1a3e]">
            Skills requeridas
            <span className="text-slate-400 ml-2 text-xs font-normal">(Enter o coma para agregar)</span>
          </label>
          <button
            type="button"
            onClick={handleExtractSkills}
            disabled={extracting || value.description.trim().length < 20}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
              extracting
                ? 'text-purple-400 border-purple-200 bg-purple-50 cursor-wait'
                : value.description.trim().length < 20
                ? 'text-slate-300 border-slate-200 bg-slate-50 cursor-not-allowed'
                : 'text-[#7c3aed] border-[#c4b5fd] bg-purple-50 hover:bg-purple-100 hover:border-[#7c3aed]'
            )}
          >
            {extracting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Detectando...
              </>
            ) : (
              <>
                <SparklesIcon />
                Detectar skills con IA
              </>
            )}
          </button>
        </div>

        {extractError && (
          <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{extractError}</p>
        )}

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
              placeholder={value.requiredSkills.length === 0 ? 'ej: Python, SQL, dbt...' : 'Agregar skill...'}
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
