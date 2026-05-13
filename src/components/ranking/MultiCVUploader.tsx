'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MultiCVUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_MB = 10;
const MAX_FILES = 10;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MultiCVUploader({ files, onFilesChange }: MultiCVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    setError(null);
    const arr = Array.from(incoming);
    const invalid = arr.find(f => !ACCEPTED.includes(f.type));
    if (invalid) { setError('Solo se aceptan archivos PDF o DOCX.'); return; }
    const tooBig = arr.find(f => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) { setError(`${tooBig.name} supera los ${MAX_MB} MB.`); return; }

    const merged = [...files, ...arr].slice(0, MAX_FILES);
    // Deduplicar por nombre
    const unique = merged.filter((f, i, self) => self.findIndex(x => x.name === f.name) === i);
    if (files.length + arr.length > MAX_FILES) setError(`Máximo ${MAX_FILES} CVs. Se agregaron los primeros.`);
    onFilesChange(unique);
  }, [files, onFilesChange]);

  const removeFile = (name: string) => {
    onFilesChange(files.filter(f => f.name !== name));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
      />

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-[#7c3aed] bg-purple-50 scale-[1.01]'
            : 'border-[#c4b5fd] hover:border-[#7c3aed] hover:bg-purple-50/50 bg-[#f8f7ff]'
        )}
      >
        <div className={cn('p-3 rounded-full transition-colors', isDragging ? 'text-[#7c3aed] bg-purple-100' : 'text-[#a78bfa] bg-purple-50')}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#1a1a3e]">
            {isDragging ? 'Soltá los CVs acá' : 'Arrastrá múltiples CVs o hacé clic'}
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF o DOCX · máx. {MAX_MB} MB · hasta {MAX_FILES} archivos</p>
        </div>
        {files.length > 0 && (
          <span className="absolute top-2 right-2 text-xs font-bold bg-[#7c3aed] text-white px-2 py-0.5 rounded-full">
            {files.length}/{MAX_FILES}
          </span>
        )}
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => {
            const ext = file.name.split('.').pop()?.toUpperCase() ?? '';
            return (
              <div key={file.name} className="flex items-center gap-3 rounded-lg border border-[#e8e4f0] bg-white px-4 py-2.5">
                <span className="text-xs font-bold text-slate-400 w-5 text-center">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a3e] truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{ext} · {formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-500 flex items-center gap-1.5"><span>⚠</span>{error}</p>}
    </div>
  );
}
