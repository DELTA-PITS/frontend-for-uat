'use client';

import { getFileSize } from '@lib/fileSizeCalc';
import { getFileIconConfig } from '@lib/fileIcon';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useEffect, useState } from 'react';
import type { UploadMode } from '@/types/files.types';
import CloseIcon from '@mui/icons-material/Close';

interface DocumentPreviewProps {
  file: File | null;
  mode: UploadMode;
  onClear?: () => void;
}

const STATUS_LABEL: Record<UploadMode, string> = {
  register: 'Ready for registration',
  verify: 'Ready for verification',
};

// Explicit hex values — DaisyUI v5 CSS var channels cannot be used in inline `style` color strings
const BADGE_BG = '#dcfce7'; // emerald-100
const BADGE_COLOR = '#77CB7E'; // emerald-700

/**
 * DocumentPreview component that displays a compact single-row preview of the selected document.
 * Shows a file-type icon (resolved by extension), file name, file size, a status badge, and a dismiss button.
 * @param file The File object to preview, or null if no file is selected
 * @param mode The upload mode — drives the status badge label ('register' | 'verify')
 * @param onClear Optional callback invoked when the user clicks the dismiss (×) button
 * @returns A React component displaying document preview information
 */
export default function DocumentPreview({ file, mode, onClear }: DocumentPreviewProps) {
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
    <div className='w-full px-6 py-3 mb-5 border border-gray-300 rounded-md'>
      <div className="w-full flex items-center justify-between ">
        <div className='flex gap-5 items-center'>
          {/* File type icon — wrapped to give it a soft background tile like in the screenshot */}
          <div className="shrink-0 flex items-center justify-center w-fit h-fit rounded-xl">
            <FileIcon style={{ fontSize: '2.3rem', color }} aria-hidden="true" />
          </div>

          {/* File name + size */}
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <span className="text-md font-normal text-base-content leading-tight truncate">
              {preview.name}
            </span>
            <span className="text-xs text-base-content/80 leading-tight">
              {preview.size}
            </span>
          </div>
        </div>
        <div className='flex gap-0 items-center'>
          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-md text-[1rem] font-medium whitespace-nowrap leading-none"
            style={{ backgroundColor: BADGE_BG, color: BADGE_COLOR, fontFamily: 'var(--font-jakarta), sans-serif' }}
            role="status"
            aria-label={STATUS_LABEL[mode]}
          >
            <CheckCircleOutlinedIcon style={{ fontSize: '1.5rem' }} aria-hidden="true" />
            <span className="leading-none pb-0.5">{STATUS_LABEL[mode]}</span>
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
