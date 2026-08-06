'use client';

import { useFileUpload } from '@hooks/useUpload';
import FileUpload from '@components/FileUpload';
import RegisterHero from '@components/register/RegisterHero';
import MetadataCard from '@components/register/MetadataCard';
import RequirementCard from '@components/register/RequirementCard';
import BeforeSubmitChecklist from '@components/register/BeforeSubmitChecklist';
import PageContainer from '@components/layout/PageContainer';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Publisher Portal landing page — deliberately styled as an institutional
 * workflow (navy accent, metadata summary, permanence warnings) rather than
 * a copy of the public Verify page, even though both share the same
 * underlying upload mechanism.
 *
 * Split out from `app/publisher/page.tsx` so the route's page.tsx can stay a
 * Server Component that checks auth (`redirect()`) before this ever renders
 * — see that file for the auth guard.
 */
export default function PublisherPortalClient() {
  const { file, isUploading, handleFileChange, handleSubmit } = useFileUpload('register');
  const { t } = useLocale();

  return (
    <div className="flex w-full flex-col">
      <RegisterHero />

      <section className="w-full bg-base-100">
        <PageContainer variant="content" className="py-8 sm:py-10">
          <FileUpload
            mode="register"
            buttonLabel={t.registerForm.button}
            accent="secondary"
            file={file}
            isUploading={isUploading}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            extraBeforeSubmit={file ? <BeforeSubmitChecklist /> : undefined}
          />
          {!isUploading ? (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <MetadataCard file={file} />
              <RequirementCard />
            </div>
          ) : null}
        </PageContainer>
      </section>
    </div>
  );
}
