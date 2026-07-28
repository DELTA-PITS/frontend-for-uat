'use client';

import { useEffect, useState } from 'react';

type RecordItem = {
  record_id: string;
  filename: string | null;
  content_hash: string;
  transaction_hash: string;
  issuer_id: string;
  created_at: string;
};

export default function DashboardPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/records')
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message ?? 'Could not load records');
        setRecords(body.records ?? []);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Registered Documents</h1>
          <p className="mt-2 text-base-content/70">Registry records and their blockchain transaction evidence.</p>
        </div>
        <a className="btn btn-primary" href="/publisher">Register document</a>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {!error && records.length === 0 ? <div className="alert">No registered documents found.</div> : null}

      {records.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
          <table className="table">
            <thead><tr><th>Filename</th><th>Registered</th><th>Content hash</th><th>Transaction</th></tr></thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.filename ?? 'Not provided'}</td>
                  <td>{new Date(record.created_at).toLocaleString()}</td>
                  <td className="max-w-xs break-all font-mono text-xs">{record.content_hash}</td>
                  <td className="max-w-xs break-all font-mono text-xs">{record.transaction_hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
