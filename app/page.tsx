'use client';

import { useFileUpload } from '@hooks/useUpload';
import FileUpload from '@components/FileUpload';
import VerifyHero from '@components/verify/VerifyHero';
import TipsCard from '@components/verify/TipsCard';
import HowItWorks from '@components/verify/HowItWorks';
import FAQSection from '@components/verify/FAQSection';
import { useLocale } from '@lib/i18n/LocaleContext';

export default function Home() {
  const { file, isUploading, handleFileChange, handleSubmit } = useFileUpload('verify');
  const { t } = useLocale();

  return (
    <div className="flex w-full flex-col">
      <VerifyHero />

      <div className="px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <FileUpload
          mode="verify"
          title={t.verifyForm.title}
          description={t.verifyForm.description}
          buttonLabel={t.verifyForm.button}
          accent="primary"
          file={file}
          isUploading={isUploading}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />
        {!isUploading ? <TipsCard /> : null}
      </div>

      {!isUploading ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <HowItWorks />
          <FAQSection />
        </div>
      ) : null}
    </div>
  );
}
