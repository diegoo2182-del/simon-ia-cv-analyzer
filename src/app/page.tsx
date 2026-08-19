'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CVUploader } from '@/components/upload/CVUploader';
import { JobDescriptionForm } from '@/components/form/JobDescriptionForm';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { JobRequirements, AnalysisResult, RankedCandidate } from '@/types/analysis';
import { AnalysisResults } from '@/components/results/AnalysisResults';
import { MultiCVUploader } from '@/components/ranking/MultiCVUploader';
import { RankingTable } from '@/components/ranking/RankingTable';

const DEFAULT_JOB: JobRequirements = {
  description: '',
  requiredSkills: [],
  seniority: 'Senior',
};

type Mode = 'individual' | 'ranking';

function SparklesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg className="w-6 h-6 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-slate-600">
      <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] shrink-0" />
      {text}
    </li>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('individual');
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Individual mode state
  const [file, setFile] = useState<File | null>(null);
  const [jobReqs, setJobReqs] = useState<JobRequirements>(DEFAULT_JOB);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ranking mode state
  const [rankingFiles, setRankingFiles] = useState<File[]>([]);
  const [rankingJobReqs, setRankingJobReqs] = useState<JobRequirements>(DEFAULT_JOB);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingResult, setRankingResult] = useState<RankedCandidate[] | null>(null);
  const [rankingError, setRankingError] = useState<string | null>(null);

  const canSubmitIndividual = file && jobReqs.description.trim().length > 20;
  const canSubmitRanking = rankingFiles.length >= 2 && rankingJobReqs.description.trim().length > 20;

  const handleReset = () => {
    setResult(null); setError(null); setFile(null); setJobReqs(DEFAULT_JOB);
  };

  const handleRankingReset = () => {
    setRankingResult(null); setRankingError(null);
    setRankingFiles([]); setRankingJobReqs(DEFAULT_JOB);
  };

  const handleAnalyze = async () => {
    if (!canSubmitIndividual) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('jobRequirements', JSON.stringify(jobReqs));
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Error al analizar el CV');
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleRanking = async () => {
    if (!canSubmitRanking) return;
    setRankingLoading(true); setRankingError(null); setRankingResult(null);
    try {
      const formData = new FormData();
      formData.append('jobRequirements', JSON.stringify(rankingJobReqs));
      rankingFiles.forEach((f, i) => formData.append(`cv_${i}`, f));
      const res = await fetch('/api/ranking', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Error al rankear candidatos');
      setRankingResult(data.candidates);
    } catch (err) {
      setRankingError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setRankingLoading(false);
    }
  };

  const infoItems = [
    'Resumen ejecutivo del candidato',
    'Score de compatibilidad (0-100)',
    'Breakdown por skills, experiencia y seniority',
    'Comparación visual CV vs vacante',
    'Detección de gaps y riesgos',
    'Preguntas de entrevista personalizadas',
    'Feedback constructivo para el candidato',
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-[#e8e4f0] bg-[#f8f7ff] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-purple-100 border border-purple-200">
              <BrainIcon />
            </div>
            <div>
              <span className="text-base font-bold text-[#1a1a3e] tracking-tight">Simon</span>
              <span className="text-base font-light text-[#7c3aed] ml-1">IA CV Analyzer</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white border border-[#e8e4f0] px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Powered by Groq
            </div>
            <a
              href="/salary"
              className="flex items-center gap-1.5 text-xs text-[#7c3aed] font-medium hover:bg-purple-50 transition-colors px-3 py-1.5 rounded-lg border border-purple-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salarios
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d0d2b] py-16 px-6">
        <div className="hero-blob" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <span className="inline-block text-xs font-semibold text-purple-300 bg-purple-900/40 border border-purple-700/40 px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
            Reclutamiento IA
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Analizá CVs con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
              Inteligencia Artificial
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Subí el CV, describí la vacante y obtené un análisis completo de compatibilidad en segundos.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Tabs de modo */}
        <div className="flex gap-2 p-1 bg-[#f8f7ff] rounded-xl border border-[#e8e4f0] w-fit mb-8">
          {([
            { key: 'individual', label: 'Análisis individual', icon: '👤' },
            { key: 'ranking',    label: 'Ranking de candidatos', icon: '🏆' },
          ] as { key: Mode; label: string; icon: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                mode === tab.key
                  ? 'bg-[#7c3aed] text-white shadow-sm shadow-purple-200'
                  : 'text-slate-500 hover:text-[#1a1a3e]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── MODO INDIVIDUAL ── */}
        {mode === 'individual' && (
          <>
            {!result && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <Card accent>
                    <CardHeader>
                      <CardTitle>
                        <span className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c3aed] text-white text-xs font-bold">1</span>
                          CV del candidato
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CVUploader onFileSelect={setFile} selectedFile={file} />
                  </Card>

                  <Card accent>
                    <CardHeader>
                      <CardTitle>
                        <span className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c3aed] text-white text-xs font-bold">2</span>
                          Descripción del puesto
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <JobDescriptionForm value={jobReqs} onChange={setJobReqs} />
                  </Card>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">⚠</span>{error}
                    </div>
                  )}

                  <Button size="lg" loading={loading} disabled={!canSubmitIndividual || loading} onClick={handleAnalyze} className="w-full">
                    <SparklesIcon />
                    {loading ? 'Analizando CV...' : 'Analizar CV con IA'}
                  </Button>

                  {!canSubmitIndividual && !loading && (
                    <p className="text-xs text-center text-slate-400">
                      {!file ? 'Subí un CV para continuar' : 'Completá la descripción (mín. 20 caracteres)'}
                    </p>
                  )}
                </div>

                <div className="space-y-5">
                  <Card className="bg-[#f8f7ff] border-[#e8e4f0]">
                    <CardHeader><CardTitle className="text-[#7c3aed]">¿Qué analiza la IA?</CardTitle></CardHeader>
                    <ul className="space-y-2.5">
                      {infoItems.map(item => <CheckItem key={item} text={item} />)}
                    </ul>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-slate-400 text-sm font-normal">Formatos soportados</CardTitle></CardHeader>
                    <div className="flex gap-2">
                      {['PDF', 'DOCX'].map(fmt => (
                        <span key={fmt} className="px-3 py-1.5 rounded-md bg-[#f8f7ff] border border-[#e8e4f0] text-xs font-mono text-slate-600">.{fmt.toLowerCase()}</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">Máximo 10 MB por archivo</p>
                  </Card>

                  {loading && (
                    <Card className="border-purple-200 bg-purple-50/50">
                      <div className="flex flex-col items-center gap-3 py-4">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 rounded-full border-2 border-purple-200" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#7c3aed] animate-spin" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#1a1a3e]">Analizando con IA</p>
                          <p className="text-xs text-slate-400 mt-1">Esto puede tomar unos segundos...</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
            {result && <AnalysisResults result={result} jobRequirements={jobReqs} onReset={handleReset} />}
          </>
        )}

        {/* ── MODO RANKING ── */}
        {mode === 'ranking' && (
          <>
            {!rankingResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <Card accent>
                    <CardHeader>
                      <CardTitle>
                        <span className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c3aed] text-white text-xs font-bold">1</span>
                          CVs de los candidatos
                          <span className="text-xs text-slate-400 font-normal">(mínimo 2, máximo 10)</span>
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <MultiCVUploader files={rankingFiles} onFilesChange={setRankingFiles} />
                  </Card>

                  <Card accent>
                    <CardHeader>
                      <CardTitle>
                        <span className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c3aed] text-white text-xs font-bold">2</span>
                          Descripción del puesto
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <JobDescriptionForm value={rankingJobReqs} onChange={setRankingJobReqs} />
                  </Card>

                  {rankingError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">⚠</span>{rankingError}
                    </div>
                  )}

                  <Button size="lg" loading={rankingLoading} disabled={!canSubmitRanking || rankingLoading} onClick={handleRanking} className="w-full">
                    <SparklesIcon />
                    {rankingLoading ? `Analizando ${rankingFiles.length} CVs...` : `Rankear ${rankingFiles.length || ''} candidatos`}
                  </Button>

                  {!canSubmitRanking && !rankingLoading && (
                    <p className="text-xs text-center text-slate-400">
                      {rankingFiles.length < 2 ? `Subí al menos 2 CVs (tenés ${rankingFiles.length})` : 'Completá la descripción (mín. 20 caracteres)'}
                    </p>
                  )}
                </div>

                <div className="space-y-5">
                  <Card className="bg-[#f8f7ff] border-[#e8e4f0]">
                    <CardHeader><CardTitle className="text-[#7c3aed]">¿Cómo funciona el ranking?</CardTitle></CardHeader>
                    <ul className="space-y-2.5">
                      {[
                        'Analizá hasta 10 CVs en paralelo',
                        'Score de compatibilidad por candidato',
                        'Tabla comparativa ordenada por score',
                        'Mejor candidato destacado automáticamente',
                        'Breakdown por categorías para cada uno',
                        'Recomendación individual por candidato',
                      ].map(item => <CheckItem key={item} text={item} />)}
                    </ul>
                  </Card>

                  {rankingLoading && (
                    <Card className="border-purple-200 bg-purple-50/50">
                      <div className="flex flex-col items-center gap-3 py-4">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 rounded-full border-2 border-purple-200" />
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#7c3aed] animate-spin" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#1a1a3e]">Analizando {rankingFiles.length} CVs</p>
                          <p className="text-xs text-slate-400 mt-1">Puede tomar varios segundos...</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
            {rankingResult && <RankingTable candidates={rankingResult} onReset={handleRankingReset} />}
          </>
        )}

      </main>
    </div>
  );
}
