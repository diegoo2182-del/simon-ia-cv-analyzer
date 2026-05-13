'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CVUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_MB = 10;

function FileIcon() {
  return (
    <svg className="w-5 h-5 text-[#7c3aed] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CVUploader({ onFileSelect, selectedFile }: CVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return 'Solo se aceptan archivos PDF o DOCX.';
    if (file.size > MAX_MB * 1024 * 1024) return `El archivo no puede superar ${MAX_MB} MB.`;
    return null;
  }, []);

  const handleFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFileSelect(file);
  }, [validate, onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    onFileSelect(null as unknown as File);
  };

  const ext = selectedFile?.name.split('.').pop()?.toUpperCase() ?? '';

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={onInputChange} />

      {!selectedFile ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            'relative flex flex-col items-center justify-center gap-3',
            'rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-[#7c3aed] bg-purple-50 scale-[1.01]'
              : 'border-[#c4b5fd] hover:border-[#7c3aed] hover:bg-purple-50/50 bg-[#f8f7ff]'
          )}
        >
          <div className={cn(
            'p-3 rounded-full transition-colors',
            isDragging ? 'text-[#7c3aed] bg-purple-100' : 'text-[#a78bfa] bg-purple-50'
          )}>
            <UploadIcon />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[#1a1a3e]">
              {isDragging ? 'Soltá el archivo acá' : 'Arrastrá tu CV o hacé clic para seleccionar'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF o DOCX — máximo {MAX_MB} MB</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-[#e8e4f0] bg-purple-50/40 p-4">
          <div className="p-2 rounded-lg bg-purple-100 border border-purple-200">
            <FileIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1a1a3e] truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ext} · {formatBytes(selectedFile.size)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Listo
            </span>
            <button
              onClick={clearFile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Eliminar archivo"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
