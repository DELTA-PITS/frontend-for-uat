'use client';

import { useEffect, useState } from 'react';
import { useFileUpload } from '@hooks/useUpload';
import OperationCard from '@components/ui/OperationCard';
import OperationButton from '@components/ui/OperationButton';
import Dropzone from './Dropzone';
import DocumentPreview from './DocumentPreview';
import LoadingCard from '@components/features/result/LoadingCard';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import type { UploadMode } from '@/types/files.types';

export interface FileUploadProps {
  /**
   * The mode of the upload: 'register' or 'verify'
   */
  mode: UploadMode;
  /**
   * The title displayed in the OperationCard
   */
  title: string;
  /**
   * The description displayed in the OperationCard
   */
  description: string;
  /**
   * Custom label for the submit button
   * @default "Submit Document"
   */
  buttonLabel?: string;
  /**
   * Additional CSS class names for the OperationCard
   */
  className?: string;
}

/**
 * A reusable file upload component that combines Dropzone, DocumentPreview, and submission logic.
 * Handles both registration and verification workflows with customizable props.
 * @param mode - The upload mode ('register' or 'verify')
 * @param title - The title for the upload card
 * @param description - The description for the upload card
 * @param buttonLabel - Custom label for the submit button
 * @param className - Additional CSS classes for the card
 * @returns A React component for file uploads with preview and submission
 */
export default function FileUpload({
  mode,
  title,
  description,
  buttonLabel = 'Submit Document',
  className,
}: FileUploadProps) {
  const { file, isUploading, handleFileChange, handleSubmit } = useFileUpload(mode);
  const [isMounted, setIsMounted] = useState(false);

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
        <Dropzone onFileSelect={handleFileChange} />
        <DocumentPreview file={file} mode={mode} onClear={() => handleFileChange(null)} />
        {isMounted && (
          <div
            className={!file ? 'tooltip tooltip-top w-full' : 'w-full'}
            data-tip={!file ? 'Please upload a document to proceed' : undefined}
          >
            <OperationButton
              onClick={handleSubmit}
              disabled={!file || isUploading}
              label={isUploading ? 'Uploading...' : buttonLabel}
              icon={
                mode === 'register' ? (
                  <SendIcon fontSize="small" aria-hidden="true" />
                ) : (
                  <CheckIcon fontSize="small" aria-hidden="true" />
                )
              }
              className={
                file && !isUploading
                  ? 'btn-primary'
                  : 'disabled:!bg-neutral-200 disabled:!text-neutral-400'
              }
            />
          </div>
        )}
      </OperationCard>
    )
  );
}

