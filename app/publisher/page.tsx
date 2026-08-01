'use client';

import { useFileUpload } from '@hooks/useUpload';
import FileUpload from '@components/FileUpload';
import RegisterHero from '@components/register/RegisterHero';
import MetadataCard from '@components/register/MetadataCard';
import RequirementCard from '@components/register/RequirementCard';
import BeforeSubmitChecklist from '@components/register/BeforeSubmitChecklist';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Publisher Portal landing page — deliberately styled as an institutional
 * workflow (navy accent, metadata summary, permanence warnings) rather than
 * a copy of the public Verify page, even though both share the same
 * underlying upload mechanism.
 */
export default function PublisherPortal() {
  const { file, isUploading, handleFileChange, handleSubmit } = useFileUpload('register');
  const { t } = useLocale();

  return (
    <div className="flex w-full flex-col">
      <RegisterHero />

      <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <FileUpload
          mode="register"
          title={t.registerForm.title}
          description={t.registerForm.description}
          buttonLabel={t.registerForm.button}
          accent="secondary"
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          extraBeforeSubmit={file ? <BeforeSubmitChecklist /> : undefined}
        />
        {!isUploading ? (
          <>
            <MetadataCard file={file} />
            <RequirementCard />
          </>
        ) : null}
      </div>
    </div>
  );
}
