import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { FilledIcon } from '@/components/ui/FilledIcon';

/**
 * BgHeader component that renders the background header for the result view.
 * @param status - A string that indicates the result status, which can be either 'success' or 'failure'. If the status is 'success', a confetti background with a check icon is displayed. If the status is 'failure', a failure icon is displayed.
 * @param source - The source of the upload operation: 'register' or 'verify'. Used to customize the failure icon.
 * @returns A React component that renders the background header based on the result status.
 */
export function BgHeader(status: 'success' | 'failure', source?: 'register' | 'verify') {
  return status === 'success' ? (
    <div className="relative mx-auto h-60 w-fit">
      <img
        src="/bg-confetti.png"
        alt=""
        aria-hidden="true"
        className="h-60 w-auto select-none object-contain"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <FilledIcon icon={<CheckIcon sx={{ fontSize: 50 }} />} className="size-20 mt-20 p-5" />
      </div>
    </div>
  ) : (
    <div className="relative mx-auto flex h-60 w-fit items-center justify-center">
      {source === 'register' ? (
        <CloudOffIcon className="text-secondary mt-30" sx={{ fontSize: 100 }} />
      ) : (
        <FilledIcon
          icon={<ClearIcon sx={{ fontSize: 50 }} />}
          className="size-20 mt-50" 
        />
        /* For verification failure and success the icon is moved up and doesn't fit on a page */
      )}
    </div>
  );
}