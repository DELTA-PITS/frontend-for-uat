import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { FilledIcon } from '@components/common/FilledIcon';

/**
 * Renders a success or failure background header illustration for the result view.
 * 
 * @param status - The status of the operation, either 'success' or 'failure'.
 * @param source - The source of the operation, either 'register' or 'verify'.
 * 
 * @returns The background header.
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
          className="size-20 mt-20"
        />
      )}
    </div>
  );
}