'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
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

/* Idle state is always neutral (border-base-300) regardless of accent —
   the accent color is reserved for when the user is actually dragging a
   file over the zone (isDragActive), not as permanent decoration. */
const ACCENT_CLASSES = {
  primary: {
    idle: 'border-base-300 bg-base-100 hover:bg-base-200/60 hover:border-base-content/30',
    active: 'border-primary bg-primary/5 hover:bg-primary/10',
    badgeIdle: 'bg-base-200 text-base-content/60',
    badgeActive: 'bg-primary/10 text-primary',
    text: 'text-primary',
  },
  secondary: {
    idle: 'border-base-300 bg-base-100 hover:bg-base-200/60 hover:border-base-content/30',
    active: 'border-secondary bg-secondary/5 hover:bg-secondary/10',
    badgeIdle: 'bg-base-200 text-base-content/60',
    badgeActive: 'bg-secondary/10 text-secondary',
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
        className={`flex flex-col items-center justify-center gap-3 w-full h-40 sm:h-56 px-6 text-center border rounded-xl cursor-pointer transition-colors ${isDragActive ? colors.active : colors.idle
          }`}
      >
        <input {...getInputProps()} />

        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${isDragActive ? colors.badgeActive : colors.badgeIdle
            }`}
        >
          <CloudUploadOutlinedIcon style={{ fontSize: '1.5rem' }} />
        </span>

        {isDragActive ? (
          <p className={`w-full text-sm font-semibold ${colors.text}`}>{t.dropzone.dragActive}</p>
        ) : (
          <>
            {/* Drag & drop copy only makes sense with a mouse — on touch devices, lead with the tap action instead */}
            <p className="w-full text-sm text-base-content/80">
              <span className="hidden sm:inline">
                <span className="font-semibold text-base-content/90">{t.dropzone.titleStrong}</span>{' '}
                {t.dropzone.titleRest} {t.dropzone.or}{' '}
              </span>
              <span className={`font-semibold ${colors.text}`}>{t.dropzone.browse}</span>
            </p>
            <p className="w-full text-xs text-base-content/50">{t.dropzone.meta}</p>
          </>
        )}
      </div>
      {rejectionMessage ? (
        <p className="mt-2 text-center text-xs text-error">{rejectionMessage}</p>
      ) : null}
    </div>
  );
}
