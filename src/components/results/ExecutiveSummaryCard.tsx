'use client';

import { useState } from 'react';
import { ExecutiveSummary } from '@/types/analysis';

interface ExecutiveSummaryCardProps {
  data: ExecutiveSummary;
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-4 h-4 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

export function ExecutiveSummaryCard({ data }: ExecutiveSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-[#7c3aed] bg-white p-6 h-full flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1a1a3e] flex items-center gap-2">
          <DocumentIcon />
          Resumen ejecutivo
        </h3>
        <button
          onClick={handleCopy}
          title={copied ? 'Copiado' : 'Copiar resumen'}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-150
            text-slate-500 border-[#e8e4f0] hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-purple-50"
        >
          <CopyIcon copied={copied} />
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {/* Texto ejecutivo */}
      <p className="text-sm text-slate-600 leading-relaxed flex-1">
        {data.summary}
      </p>

      {/* Highlights */}
      {data.highlights.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#f0edf8]">
          {data.highlights.map((highlight, i) => (
            <span
              key={i}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f8f7ff] text-[#7c3aed] border border-purple-200"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
