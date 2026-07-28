'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export interface DropzoneProps {
  /** Callback triggered when a file is selected or dropped */
  onFileSelect: (file: File | null) => void;
}

/**
 * An interactive drag-and-drop zone for selecting local files.
 * @param onFileSelect - Callback triggered when a file is selected or dropped.
 * @returns The dropzone component.
 */
export default function Dropzone({ onFileSelect }: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
    if (fileRejections.length > 0) {
      console.log("File rejections:", fileRejections);
      onFileSelect(null);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="w-full max-w-3xl mx-auto mb-5">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full h-64 border-[1.5px] border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive
          ? 'border-primary bg-primary/10 hover:bg-primary/20 hover:border-primary'
          : 'border-primary bg-base-100 hover:bg-base-200 hover:border-primary'
          }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-base-content/70">
          <svg className="w-20 h-20 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
          </svg>

          {isDragActive ? (
            <p className="text-primary font-semibold">Drop the files here ...</p>
          ) : (
            <>
              <p className="mb-1 text-2xl text-base-content/90"><span className="font-semibold">Drag & Drop</span> to Upload File</p>
              <p className="mb-1 text-xl text-base-content/80">or</p>
              <p className="text-xl text-base-content/90">Click to Browse</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}