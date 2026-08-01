'use client';

import { useEffect, useState, type ReactNode } from 'react';
import OperationCard from '@components/common/OperationCard';
import OperationButton from '@components/common/OperationButton';
import Dropzone from '@components/common/Dropzone';
import DocumentPreview from '@components/common/DocumentPreview';
import LoadingCard from '@components/common/LoadingCard';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import type { UploadMode } from '@/types/files.types';
import { useLocale } from '@lib/i18n/LocaleContext';

export interface FileUploadProps {
  /** The upload mode ('register' | 'verify') driving the workflow and labels */
  mode: UploadMode;
  /** The title displayed in the operation card header */
  title: string;
  /** A brief description displayed below the title in the operation card */
  description: string;
  /** Custom label for the submit button. Defaults to 'Kirim Dokumen' */
  buttonLabel?: string;
  /** Additional CSS class names for custom styling */
  className?: string;
  /** Visual accent for the dropzone — 'primary' (teal) or 'secondary' (navy). Defaults to 'primary'. */
  accent?: 'primary' | 'secondary';
  /** Currently selected file (state lifted to the page so it can drive sibling sections like a metadata summary) */
  file: File | null;
  /** Whether a submit request is in flight */
  isUploading: boolean;
  /** Called when the user selects/clears a file */
  onFileChange: (file: File | null) => void;
  /** Called when the user submits the selected file */
  onSubmit: () => void;
  /** Optional extra content rendered between the file preview and the submit button (e.g. a "before you submit" checklist) */
  extraBeforeSubmit?: ReactNode;
}

/**
 * Shared upload UI (dropzone, file preview, submit button) for both the
 * register and verify workflows. Layout/mood differences between the two
 * pages live in the pages themselves (hero, tips, requirements, etc.) —
 * this component only owns the mechanics of picking and submitting a file.
 * @returns The file upload component.
 */
export default function FileUpload({
  mode,
  title,
  description,
  buttonLabel,
  className,
  accent = 'primary',
  file,
  isUploading,
  onFileChange,
  onSubmit,
  extraBeforeSubmit,
}: FileUploadProps) {
  const { t } = useLocale();
  const [isMounted, setIsMounted] = useState(false);
  const resolvedButtonLabel = buttonLabel ?? t.registerForm.button;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    isUploading ? (
      <div className={`mx-auto my-auto ${className ?? ''}`.trim()}>
        <LoadingCard />
      </div>
    ) : (
      <OperationCard
        title={title}
        description={description}
        className={`mx-auto my-auto ${className ?? ''}`.trim()}
      >
        <Dropzone onFileSelect={onFileChange} accent={accent} />
        <DocumentPreview file={file} mode={mode} onClear={() => onFileChange(null)} />
        {extraBeforeSubmit}
        {isMounted && (
          <div
            className={`sticky bottom-4 z-10 -mx-4 bg-base-100/95 px-4 py-2 backdrop-blur-sm sm:static sm:z-auto sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none ${!file ? 'tooltip tooltip-top w-full' : 'w-full'}`}
            data-tip={!file ? t.uploadTooltip : undefined}
          >
            <OperationButton
              onClick={onSubmit}
              disabled={!file || isUploading}
              label={isUploading ? t.uploading : resolvedButtonLabel}
              icon={
                mode === 'register' ? (
                  <SendIcon fontSize="small" aria-hidden="true" />
                ) : (
                  <CheckIcon fontSize="small" aria-hidden="true" />
                )
              }
              className={
                file && !isUploading ? 'btn-primary' : ''
              }
            />
          </div>
        )}
      </OperationCard>
    )
  );
}
