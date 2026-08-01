'use client';

import { useState } from 'react';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';

interface CopyButtonProps {
  /** The raw text value to copy to the clipboard */
  value: string;
  /** Accessible label describing what is being copied (e.g. "content hash") */
  label: string;
}

/**
 * A small icon button that copies the given value to the clipboard and
 * briefly shows a checkmark as confirmation.
 * @param value - The raw text value to copy to the clipboard.
 * @param label - Accessible label describing what is being copied.
 * @returns The copy button.
 */
export default function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (e.g. insecure context) — silently ignore, button just stays as-is.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Salin ${label}`}
      title={`Salin ${label}`}
      className="shrink-0 rounded-md p-1 text-base-content/60 transition-colors hover:bg-base-200 hover:text-primary"
    >
      {copied ? (
        <CheckIcon className="text-success" style={{ fontSize: '1rem' }} />
      ) : (
        <ContentCopyOutlinedIcon style={{ fontSize: '1rem' }} />
      )}
    </button>
  );
}
