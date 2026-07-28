import { signIn } from '../../../lib/authentication';

interface SignInProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * SignIn component
 */
export default function SignIn({
  className,
  children,
}: SignInProps) {
  return (
    <form action={signIn}>
      <button
        type="submit"
        className={className}
      >
        {children}
      </button>
    </form>
  );
}