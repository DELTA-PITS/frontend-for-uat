'use client';

import { useEffect, useState } from 'react';
import Card from '@components/common/OperationCard';
import OperationButton from '@components/common/OperationButton';
import CopyButton from '@components/dashboard/CopyButton';
import { readResultPayload } from '@/lib/resultPayload';
import type { ResultPayload } from '@/types';
import { getUploadFailureMessage } from '@/lib/uploadErrorMessage';
import { formatDisplayDateTime } from '@lib/dateFormat';
import type { RegisterData, VerifyData, RawData, ResultStatus } from '@/types/';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useLocale } from '@lib/i18n/LocaleContext';
import type { Dictionary } from '@lib/i18n/translations';

interface ResultViewProps {
  status: ResultStatus;
}

type VerifyResultData = VerifyData & {
  filename: string | null;
};

function asData(value: unknown): RawData {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RawData) : {};
}

function getString(data: RawData, key: string) {
  return typeof data[key] === 'string' ? data[key] : null;
}

function getBoolean(data: RawData, key: string) {
  return typeof data[key] === 'boolean' ? data[key] : null;
}

function getRegisterData(value: unknown): RegisterData {
  const data = asData(value);

  return {
    content_hash: getString(data, 'content_hash'),
    record_id: getString(data, 'record_id'),
    created_at: getString(data, 'created_at'),
    transaction_hash: getString(data, 'transaction_hash'),
    issuer_id: getString(data, 'issuer_id'),
    filename: getString(data, 'filename'),
  };
}

function getVerifyData(value: unknown): VerifyResultData {
  const data = asData(value);

  return {
    valid: getBoolean(data, 'valid'),
    content_hash: getString(data, 'content_hash'),
    record_id: getString(data, 'record_id'),
    created_at: getString(data, 'created_at'),
    filename: getString(data, 'filename') ?? getString(data, 'file_name') ?? getString(data, 'document_name'),
    transaction_hash: getString(data, 'transaction_hash'),
    issuer_id: getString(data, 'issuer_id'),
  };
}

function DetailRow({
  label,
  value,
  copyable,
  notAvailable,
}: {
  label: string;
  value: string | null;
  copyable?: boolean;
  notAvailable: string;
}) {
  const display = value && value.trim().length > 0 ? value : notAvailable;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-base-300 py-3 last:border-b-0">
      <span className="shrink-0 text-xs text-ink-secondary">{label}</span>
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 break-all text-right text-xs font-medium text-base-content">{display}</span>
        {copyable && value ? <CopyButton value={value} label={label} /> : null}
      </div>
    </div>
  );
}

function StatusIcon({ tone, icon }: { tone: 'success' | 'error'; icon: React.ReactNode }) {
  const toneClass = tone === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error';
  return (
    <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${toneClass}`}>
      {icon}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{children}</p>;
}

/**
 * Renders the result view for a given operation status. Styled as one clear
 * card per outcome (registered / verified / not found / error) rather than
 * a generic green alert box — the result of a trust-system check should
 * feel like the main event of the page, not a toast.
 */
export default function ResultView({ status }: ResultViewProps) {
  const { t, locale }: { t: Dictionary; locale: 'id' | 'en' } = useLocale();
  // Read once on mount rather than during render — sessionStorage isn't
  // available during SSR, so starting from `null` keeps the first client
  // render consistent with the server-rendered markup (avoids a hydration
  // mismatch), then this fills in on mount.
  const [payload, setPayload] = useState<ResultPayload | null>(null);
  useEffect(() => {
    setPayload(readResultPayload());
  }, []);

  const data = payload?.response?.data;
  const registerData = getRegisterData(data);
  const verifyData = getVerifyData(data);

  const isRegistration = payload?.source === 'register';
  const isFileVerification = payload?.source === 'verify';

  const failureMessage = getUploadFailureMessage({
    source: payload?.source ?? 'register',
    response: payload?.response,
    error: payload?.error,
    t,
  });

  const backHref = isRegistration ? '/publisher' : '/';
  const backLabel = isRegistration ? t.result.backToRegister : t.result.backToHome;

  return (
    <Card
      title=""
      description=""
      className="mx-auto my-auto"
      containerClassName="!max-w-2xl"
    >
      {payload?.status !== status ? <p className="text-warning">{t.result.mismatchWarning}</p> : null}

      {status === 'success' ? (
        isRegistration ? (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex flex-col items-center gap-3 text-center">
              <StatusIcon tone="success" icon={<CheckIcon style={{ fontSize: '2.5rem' }} />} />
              <h1 className="text-[2rem] font-bold text-secondary">{t.result.registerSuccessTitle}</h1>
              <p className="text-xs text-ink-secondary">{t.result.registerSuccessBody}</p>
            </div>

            <div className="rounded-2xl border border-base-300 p-5">
              <SectionLabel>{t.result.documentSection}</SectionLabel>
              <DetailRow label={t.result.filename} value={registerData.filename} notAvailable={t.result.notAvailable} />
              <DetailRow
                label={t.result.registeredAt}
                value={formatDisplayDateTime(registerData.created_at, locale)}
                notAvailable={t.result.notAvailable}
              />
              <DetailRow label={t.result.recordId} value={registerData.record_id} copyable notAvailable={t.result.notAvailable} />

              <div className="mt-5">
                <SectionLabel>{t.result.blockchainSection}</SectionLabel>
              </div>
              <DetailRow label={t.result.contentHash} value={registerData.content_hash} copyable notAvailable={t.result.notAvailable} />
              <DetailRow label={t.result.txHash} value={registerData.transaction_hash} copyable notAvailable={t.result.notAvailable} />
            </div>
          </div>
        ) : isFileVerification ? (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex flex-col items-center gap-3 text-center">
              <StatusIcon tone="success" icon={<GppGoodOutlinedIcon style={{ fontSize: '2.5rem' }} />} />
              <h1 className="text-[2rem] font-bold text-secondary">{t.result.verifySuccessTitle}</h1>
              <p className="max-w-sm text-xs text-ink-secondary">{t.result.verifySuccessBody}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-success/20 bg-success/5 px-4 py-3">
                <CheckIcon className="text-success" style={{ fontSize: '1.2rem' }} />
                <div>
                  <p className="text-xs text-ink-muted">{t.result.integrity}</p>
                  <p className="text-xs font-semibold text-success">{t.result.valid}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-success/20 bg-success/5 px-4 py-3">
                <CheckIcon className="text-success" style={{ fontSize: '1.2rem' }} />
                <div>
                  <p className="text-xs text-ink-muted">{t.result.blockchain}</p>
                  <p className="text-xs font-semibold text-success">{t.result.recorded}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 p-5">
              <DetailRow label={t.result.recordId} value={verifyData.record_id} copyable notAvailable={t.result.notAvailable} />
              <DetailRow
                label={t.result.registeredAt}
                value={formatDisplayDateTime(verifyData.created_at, locale)}
                notAvailable={t.result.notAvailable}
              />
              <DetailRow label={t.result.contentHash} value={verifyData.content_hash} copyable notAvailable={t.result.notAvailable} />
              <DetailRow label={t.result.txHash} value={verifyData.transaction_hash} copyable notAvailable={t.result.notAvailable} />
            </div>
          </div>
        ) : null
      ) : isFileVerification ? (
        <div className="flex flex-col gap-6 text-left">
          <div className="flex flex-col items-center gap-3 text-center">
            <StatusIcon tone="error" icon={<SearchOffOutlinedIcon style={{ fontSize: '2.5rem' }} />} />
            <h1 className="text-[2rem] font-bold text-secondary">{t.result.notFoundTitle}</h1>
            <p className="max-w-sm text-xs text-ink-secondary">{t.result.notFoundBody}</p>
          </div>

          <div className="rounded-2xl border border-base-300 p-5">
            <p className="mb-3 text-xs font-semibold text-base-content">{t.result.possibleCauses}</p>
            <ul className="flex flex-col gap-2 text-xs text-ink-secondary">
              <li>&bull; {t.result.causeWrongFile}</li>
              <li>&bull; {t.result.causeModified}</li>
              <li>&bull; {t.result.causeNeverRegistered}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 text-left">
          <div className="flex flex-col items-center gap-3 text-center">
            <StatusIcon tone="error" icon={<CloseIcon style={{ fontSize: '2.5rem' }} />} />
            <h1 className="text-[2rem] font-bold text-secondary">
              {isRegistration ? t.result.registerFailTitle : t.result.genericErrorTitle}
            </h1>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-error/5 p-4">
            <ErrorOutlineOutlinedIcon className="mt-0.5 shrink-0 text-error" />
            <p className="text-xs text-base-content">{failureMessage}</p>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <OperationButton
          onClick={() => {
            window.location.href = backHref;
          }}
          label={backLabel}
          icon={<ChevronLeftIcon fontSize="small" aria-hidden="true" />}
          className="btn-primary"
        />
      </div>
    </Card>
  );
}
