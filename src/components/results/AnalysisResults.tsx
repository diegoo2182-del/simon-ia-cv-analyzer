'use client';

import { AnalysisResult, JobRequirements } from '@/types/analysis';
import { ScoreCard } from './ScoreCard';
import { CVVacancyComparison } from './CVVacancyComparison';
import { SkillsBreakdown } from './SkillsBreakdown';
import { ExecutiveSummaryCard } from './ExecutiveSummaryCard';
import { GapsRisksCard } from './GapsRisksCard';
import { RecommendationCard } from './RecommendationCard';
import { InterviewQuestionsCard } from './InterviewQuestionsCard';
import { CandidateFeedbackCard } from './CandidateFeedbackCard';

interface AnalysisResultsProps {
  result: AnalysisResult;
  jobRequirements: JobRequirements;
  onReset: () => void;
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

export function AnalysisResults({ result, jobRequirements, onReset }: AnalysisResultsProps) {
  return (
    <div className="mt-8 space-y-5">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-lg font-bold text-[#1a1a3e]">Resultados del análisis</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#7c3aed] transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50 border border-transparent hover:border-[#e8e4f0]"
        >
          <RefreshIcon />
          Nuevo análisis
        </button>
      </div>

      {/* Fila 1: Score + Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up">
        <div className="md:col-span-1">
          <ScoreCard score={result.compatibilityScore} categoryScores={result.categoryScores} />
        </div>
        <div className="md:col-span-2 animate-fade-in-up delay-100">
          <ExecutiveSummaryCard data={result.executiveSummary} />
        </div>
      </div>

      {/* Fila 2: Comparación CV vs Vacante */}
      <div className="animate-fade-in-up delay-200">
        <CVVacancyComparison
          matchingSkills={result.matchingSkills}
          missingSkills={result.missingSkills}
          detectedSkills={result.detectedSkills}
        />
      </div>

      {/* Fila 3: Perfil de skills */}
      <div className="animate-fade-in-up delay-300">
        <SkillsBreakdown data={result.skillsBreakdown} />
      </div>

      {/* Fila 4: Gaps y riesgos */}
      <div className="animate-fade-in-up delay-400">
        <GapsRisksCard data={result.gapsAnalysis} />
      </div>

      {/* Fila 5: Recomendación final */}
      <div className="animate-fade-in-up delay-400">
        <RecommendationCard
          recommendation={result.recommendation}
          reason={result.recommendationReason}
        />
      </div>

      {/* Fila 6: Preguntas de entrevista (on demand) */}
      <div className="animate-fade-in-up delay-400">
        <InterviewQuestionsCard analysisResult={result} jobRequirements={jobRequirements} />
      </div>

      {/* Fila 7: Feedback para el candidato (on demand) */}
      <div className="animate-fade-in-up delay-400">
        <CandidateFeedbackCard analysisResult={result} jobRequirements={jobRequirements} />
      </div>

    </div>
  );
}
