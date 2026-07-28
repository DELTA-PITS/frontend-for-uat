'use client';

import { useEffect, useState } from 'react';
import { useFileUpload } from '@hooks/useUpload';
import OperationCard from '@components/common/OperationCard';
import OperationButton from '@components/common/OperationButton';
import Dropzone from '@components/common/Dropzone';
import DocumentPreview from '@components/common/DocumentPreview';
import LoadingCard from '@components/common/LoadingCard';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import type { UploadMode } from '@/types/files.types';

export interface FileUploadProps {
  /** The upload mode ('register' | 'verify') driving the workflow and labels */
  mode: UploadMode;
  /** The title displayed in the operation card header */
  title: string;
  /** A brief description displayed below the title in the operation card */
  description: string;
  /** Custom label for the submit button. Defaults to 'Submit Document' */
  buttonLabel?: string;
  /** Additional CSS class names for custom styling */
  className?: string;
}

/**
 * A reusable file upload component coordinating dropzone, document preview, and submission behaviors.
 * 
 * @param mode - The upload mode ('register' | 'verify') driving the workflow and labels
 * @param title - The title displayed in the operation card header
 * @param description - A brief description displayed below the title in the operation card
 * @param buttonLabel - Custom label for the submit button. Defaults to 'Submit Document'
 * @param className - Additional CSS class names for custom styling
 * 
 * @returns The file upload component.
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
                file && !isUploading ? 'btn-primary' : ''
              }
            />
          </div>
        )}
      </OperationCard>
    )
  );
}

