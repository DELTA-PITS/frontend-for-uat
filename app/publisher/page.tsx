'use client';

import FileUpload from '@components/FileUpload';

/**
 * Publisher Portal landing page component that provides an interface for users to upload files for registration in the Public Trust Information System (PITS).
 * Uses the FileUpload component to manage the file upload workflow for document registration.
 * @returns A React component that serves as the landing page for the publisher portal, allowing users to upload files for registration in PITS.
 */
export default function PublisherPortal() {
  return (
    <FileUpload
      mode="register"
      title="Register New Document"
      description="Upload and register a new document to the system"
      buttonLabel="Submit Document"
    />
  );
}