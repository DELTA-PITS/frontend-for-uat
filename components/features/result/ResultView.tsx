'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@components/common/OperationCard';
import OperationButton from '@components/common/OperationButton';
import SummaryRow from '@components/common/SummaryRow';
import { parseResultPayload } from '@/lib/resultPayload';
import { getUploadFailureMessage } from '@/lib/uploadErrorMessage';
import { formatDisplayDateTime } from '@lib/dateFormat';
import type { RegisterData, VerifyData, RawData, ResultStatus } from '@/types/';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import CheckIcon from '@mui/icons-material/Check';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { BgHeader } from '@components/BgHeader';

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

/**
 * Renders the result view for a given operation status.
 */
export default function ResultView({ status }: ResultViewProps) {
  const searchParams = useSearchParams();
  const payload = useMemo(() => parseResultPayload(searchParams.get('payload')), [searchParams]);

  const data = payload?.response?.data;
  const registerData = getRegisterData(data);
  const verifyData = getVerifyData(data);

  const isRegistration = payload?.source === 'register';
  const isFileVerification = payload?.source === 'verify';

  const failureMessage = getUploadFailureMessage({
    source: payload?.source ?? 'register',
    response: payload?.response,
    error: payload?.error,
  });

  const backHref = isRegistration ? '/publisher' : '/';
  const backLabel = isRegistration ? 'Back to Upload' : 'Back to Home';

  return (
    <Card
      headerContent={BgHeader(status, payload?.source)}
      title={
        status === 'success'
          ? isFileVerification
            ? 'Document Verified Successfully!'
            : 'Document Registered Successfully!'
          : isFileVerification
            ? 'Failed to Verify a Document'
            : 'Failed to Register a Document'
      }
      description={
        status === 'success'
          ? isFileVerification
            ? 'The document matches the registered hash.'
            : 'The registration process succeeded'
          : isFileVerification
            ? 'The verification process could not be completed.'
            : ''
      }
      className="mx-auto my-auto"
      containerClassName="lg:max-w-6xl"
    >
      {payload?.status !== status ? (
        <p className="text-warning">This payload belongs to the other result page.</p>
      ) : null}

      {status === 'success' ? (
        isRegistration ? (
          <div className="space-y-10 text-sm">
            <SummaryRow
              icon={<CalendarMonthOutlinedIcon fontSize="medium" />}
              label="Created at"
              value={formatDisplayDateTime(registerData.created_at)}
            />

            <SummaryRow icon={<TagOutlinedIcon fontSize="medium" />} label="Record ID" value={registerData.record_id} />

            <SummaryRow
              icon={<StorageOutlinedIcon fontSize="medium" />}
              label="Content Hash"
              value={registerData.content_hash}
            />

            <SummaryRow icon={<TagOutlinedIcon fontSize="medium" />} label="Filename" value={registerData.filename} />
            <SummaryRow icon={<StorageOutlinedIcon fontSize="medium" />} label="Blockchain Transaction" value={registerData.transaction_hash} />
          </div>
        ) : isFileVerification ? (
          <div className="space-y-5 text-left">
            <h3 className="text-lg font-bold text-primary">Registration Details</h3>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

              <div className="md:col-span-2">
                <SummaryRow
                  icon={<TagOutlinedIcon fontSize="medium" />}
                  label="Record ID"
                  value={verifyData.record_id}
                />
              </div>
              <div className="md:col-span-2">
                <SummaryRow
                  icon={<CalendarMonthOutlinedIcon fontSize="medium" />}
                  label="Registered at"
                  value={formatDisplayDateTime(verifyData.created_at)}
                />
              </div>

              {/*}
                  <div className="md:col-span-2"> 
                  <SummaryRow
                    icon={<DescriptionOutlinedIcon fontSize="medium" />}
                    label="Filename"
                    value={verifyData.filename ?? 'N/A'}
                  />
                </div> 
              */}
              <div className="md:col-span-2">
                <SummaryRow
                  icon={<StorageOutlinedIcon fontSize="medium" />}
                  label="Content Hash"
                  value={verifyData.content_hash}
                />
              </div>
                          <div className="md:col-span-2">
                <SummaryRow
                  icon={<StorageOutlinedIcon fontSize="medium" />}
                  label="Blockchain Transaction"
                  value={verifyData.transaction_hash}
                />
              </div>
</div>

            <div className="flex flex-col gap-4 rounded-xl border border-success/20 bg-success/10 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckIcon fontSize="large" />
                </div>

                <div>
                  <p className="font-semibold text-success">Registered and Unchanged</p>

                  <p className="text-sm text-base-content/70">
                    The uploaded file matches the registered SHA-256 hash and its blockchain-anchored evidence. This confirms integrity, not the truthfulness of the document content.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-success/20 bg-base-100 px-4 py-2 text-sm font-medium text-success">
                Verified on Blockchain
              </div>
            </div>
          </div>
        ) : null
      ) : isFileVerification ? (
        <div className="space-y-6 text-left">
          <p className="text-xl font-bold text-secondary">What can you do?</p>

          <div className="flex items-start gap-4 border-b border-base-300 pb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <TagOutlinedIcon fontSize="medium" />
            </div>

            <div>
              <h4 className="font-semibold text-primary">Check the document details</h4>
              <p className="mt-1 text-base-content/60">
                Ensure that the document hash or identifier was entered correctly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 border-b border-base-300 pb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <SearchOutlinedIcon fontSize="medium" />
            </div>

            <div>
              <h4 className="font-semibold text-primary">Check document availability</h4>
              <p className="mt-1 text-base-content/60">
                Ensure that the document has already been registered in the system.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-base-content">{failureMessage}</p>
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