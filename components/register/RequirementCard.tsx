'use client';

import RuleOutlinedIcon from '@mui/icons-material/Rule';
import InfoListCard from '@components/common/InfoListCard';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Lists the file requirements for registration — placed near the upload
 * area on the Register page so publishers know what's expected before
 * they pick a file, reducing failed-submission round trips.
 */
export default function RequirementCard() {
  const { t } = useLocale();

  return (
    <InfoListCard heading={t.requirement.heading} headingIcon={RuleOutlinedIcon} items={t.requirement.items} bullet="dot" />
  );
}
