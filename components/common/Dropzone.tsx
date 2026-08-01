'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useLocale } from '@lib/i18n/LocaleContext';
import type { Dictionary } from '@lib/i18n/translations';

function getRejectionMessage(fileRejections: FileRejection[], t: Dictionary): string {
  const code = fileRejections[0]?.errors[0]?.code;
  if (code === 'file-too-large') return t.dropzone.errorTooLarge;
  if (code === 'file-invalid-type') return t.dropzone.errorInvalidType;
  return t.dropzone.errorGeneric;
}

export interface DropzoneProps {
  /** Callback triggered when a file is selected or dropped */
  onFileSelect: (file: File | null) => void;
  /** Visual accent — 'primary' (teal, verification/public context) or 'secondary' (navy, institutional/register context). Defaults to 'primary'. */
  accent?: 'primary' | 'secondary';
}

const ACCENT_CLASSES = {
  primary: {
    idle: 'border-primary bg-base-100 hover:bg-base-200 hover:border-primary',
    active: 'border-primary bg-primary/10 hover:bg-primary/20 hover:border-primary',
    text: 'text-primary',
  },
  secondary: {
    idle: 'border-secondary/60 bg-base-100 hover:bg-base-200 hover:border-secondary',
    active: 'border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-secondary',
    text: 'text-secondary',
  },
} as const;

/**
 * An interactive drag-and-drop zone for selecting local files.
 * @param onFileSelect - Callback triggered when a file is selected or dropped.
 * @param accent - Visual accent driving border/background color. Defaults to 'primary'.
 * @returns The dropzone component.
 */
export default function Dropzone({ onFileSelect, accent = 'primary' }: DropzoneProps) {
  const { t } = useLocale();
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      setRejectionMessage(null);
      onFileSelect(acceptedFiles[0]);
    }
    if (fileRejections.length > 0) {
      setRejectionMessage(getRejectionMessage(fileRejections, t));
      onFileSelect(null);
    }
  }, [onFileSelect, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
  });

  const colors = ACCENT_CLASSES[accent];

  return (
    <div className="w-full max-w-3xl mx-auto mb-5">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full h-40 sm:h-64 border-[1.5px] border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? colors.active : colors.idle
          }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-base-content/70">
          <svg className="hidden w-20 h-20 mb-4 sm:block" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
          </svg>

          {isDragActive ? (
            <p className={`font-semibold ${colors.text}`}>{t.dropzone.dragActive}</p>
          ) : (
            <>
              {/* Drag & drop copy only makes sense with a mouse — on touch devices, lead with the tap action instead */}
              <p className="mb-1 hidden text-lg text-base-content/90 sm:block">
                <span className="font-semibold">{t.dropzone.titleStrong}</span> {t.dropzone.titleRest}
              </p>
              <p className="mb-1 hidden text-lg text-base-content/80 sm:block">{t.dropzone.or}</p>
              <p className="text-lg font-semibold text-base-content/90 sm:font-normal">{t.dropzone.browse}</p>
              <p className="mt-3 text-xs text-base-content/50">{t.dropzone.meta}</p>
            </>
          )}
        </div>
      </div>
      {rejectionMessage ? (
        <p className="mt-2 text-center text-xs text-error">{rejectionMessage}</p>
      ) : null}
    </div>
  );
}
