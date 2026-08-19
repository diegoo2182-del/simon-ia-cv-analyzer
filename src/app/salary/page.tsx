'use client';

import Link from 'next/link';
import { SalaryAnalyzer } from '@/components/salary/SalaryAnalyzer';

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-6 h-6 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function SalaryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
          >
            <ArrowLeftIcon />
            Volver al analizador
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <MoneyIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analizador de Salarios</h1>
              <p className="text-sm text-slate-500">
                Compará expectativas salariales por región · Conversión ARS/USD/UYU en tiempo real · Tipo de cambio MEP
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <SalaryAnalyzer />
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-400 text-center mt-6">
          Tipo de cambio ARS: dólar MEP (financiero) · Fuentes: ExchangeRate API · DolarApi.com · Bluelytics
        </p>
      </div>
    </div>
  );
}
