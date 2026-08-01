'use client';

import { getFileSize } from '@lib/fileSizeCalc';
import { getFileIconConfig } from '@lib/fileIcon';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useEffect, useState } from 'react';
import type { UploadMode } from '@/types/files.types';
import CloseIcon from '@mui/icons-material/Close';
import { useLocale } from '@lib/i18n/LocaleContext';

interface DocumentPreviewProps {
  /** The File object to preview, or null if no file is selected */
  file: File | null;
  /** The upload mode which controls the status badge label ('register' | 'verify') */
  mode: UploadMode;
  /** Callback triggered when the clear/dismiss button is clicked */
  onClear?: () => void;
}

/**
 * Renders a compact, single-row preview of the selected file with size, status, and clear action.
 * @param file - The File object to preview, or null if no file is selected.
 * @param mode - The upload mode which controls the status badge label ('register' | 'verify').
 * @param onClear - Callback triggered when the clear/dismiss button is clicked.
 * @returns The document preview component.
 */
export default function DocumentPreview({ file, mode, onClear }: DocumentPreviewProps) {
  const { t } = useLocale();
  const statusLabel = mode === 'register' ? t.documentPreview.readyRegister : t.documentPreview.readyVerify;
  const [preview, setPreview] = useState<{
    name: string;
    size: string;
  } | null>(null);

  useEffect(() => {
    if (file) {
      setPreview({
        name: file.name,
        size: getFileSize(file),
      });
    } else {
      setPreview(null);
    }
  }, [file]);

  if (!preview) {
    return null;
  }

  const { Icon: FileIcon, color } = getFileIconConfig(preview.name);

  return (
    <div className='w-full px-4 sm:px-6 py-3 mb-5 border border-base-300 rounded-md'>
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className='flex gap-3 sm:gap-5 items-center w-full sm:w-auto min-w-0'>
          {/* File type icon — wrapped to give it a soft background tile like in the screenshot */}
          <div className="shrink-0 flex items-center justify-center w-fit h-fit rounded-xl">
            <FileIcon style={{ fontSize: '2.3rem', color }} aria-hidden="true" />
          </div>

          {/* File name + size */}
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <span className="text-sm font-normal text-base-content leading-tight truncate">
              {preview.name}
            </span>
            <span className="text-xs text-base-content/80 leading-tight">
              {preview.size}
            </span>
          </div>
        </div>
        <div className='flex gap-2 sm:gap-0 items-center w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0'>
          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-md text-[1rem] font-medium whitespace-nowrap leading-none bg-success/20 text-success"
            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            role="status"
            aria-label={statusLabel}
          >
            <CheckCircleOutlinedIcon style={{ fontSize: '1.5rem' }} aria-hidden="true" />
            <span className="leading-none pb-0.5">{statusLabel}</span>
          </div>

          {/* Dismiss button */}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="ml-1 cursor-pointer text-base-content hover:text-base-content hover:bg-base-100 rounded-md p-1.5 transition-colors leading-none flex items-center justify-center"
              aria-label="Remove file"
            >
              <CloseIcon style={{ fontSize: '1.5rem' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
