'use client';

import InfoListCard from '@components/common/InfoListCard';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Trust-building card shown below the upload card on the public Verify
 * page. Framed around "why this system can be trusted" rather than a bare
 * checklist of file constraints — public visitors care more about
 * legitimacy than technical specs.
 */
export default function TipsCard() {
  const { t } = useLocale();

  return (
    <InfoListCard className="mt-6" heading={t.tips.heading} items={t.tips.items} columns={2} bullet="check" />
  );
}
