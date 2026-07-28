'use client';

import FileUpload from '@components/FileUpload';

export default function Home() {
  return (
    <FileUpload
      mode="verify"
      title="Verify a Document"
      description="Upload a document to validate authenticity and integrity"
      buttonLabel="Verify Document"
    />
  );
}