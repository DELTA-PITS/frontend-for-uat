'use client';

import { Suspense } from 'react';
import { useFileUpload } from '@hooks/useUpload';
import FileUpload from '@components/FileUpload';
import VerifyHero from '@components/verify/VerifyHero';
import TipsCard from '@components/verify/TipsCard';
import HowItWorks from '@components/verify/HowItWorks';
import FAQSection from '@components/verify/FAQSection';
import LogoutBanner from '@components/verify/LogoutBanner';
import PageContainer from '@components/layout/PageContainer';
import { useLocale } from '@lib/i18n/LocaleContext';

export default function Home() {
  const { file, isUploading, handleFileChange, handleSubmit } = useFileUpload('verify');
  const { t } = useLocale();

  return (
    <div className="flex w-full flex-col">
      <Suspense fallback={null}>
        <LogoutBanner />
      </Suspense>

      <VerifyHero />

      <section className="w-full bg-base-100">
        <PageContainer variant="content" className="py-8 sm:py-10">
          <FileUpload
            mode="verify"
            buttonLabel={t.verifyForm.button}
            accent="primary"
            file={file}
            isUploading={isUploading}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
          />
          {!isUploading ? <TipsCard /> : null}
        </PageContainer>
      </section>

      {!isUploading ? (
        <section className="w-full bg-base-200">
          <PageContainer variant="content" className="py-14 sm:py-16">
            <HowItWorks />
          </PageContainer>
        </section>
      ) : null}

      {!isUploading ? (
        <section className="w-full bg-base-100">
          <PageContainer variant="content" className="py-14 sm:py-16">
            <FAQSection />
          </PageContainer>
        </section>
      ) : null}
    </div>
  );
}
