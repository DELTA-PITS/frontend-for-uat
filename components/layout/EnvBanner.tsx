/**
 * Thin notice shown only when NEXT_PUBLIC_ENV_LABEL is set at build time (the public-chain rehearsal build).
 * The production build has no such variable, so nothing is rendered there.
 */
export function EnvBanner() {
  const label = (process.env.NEXT_PUBLIC_ENV_LABEL ?? '').trim();
  if (!label) return null;

  return (
    <div
      role="status"
      data-testid="env-banner"
      className="border-b border-warning/40 bg-warning/20 px-4 py-1 text-center text-xs font-medium text-base-content"
    >
      {label}
    </div>
  );
}
