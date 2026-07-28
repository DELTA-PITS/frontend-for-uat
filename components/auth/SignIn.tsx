import { signIn } from '@lib/authentication';

interface SignInProps {
  /** Additional CSS class names for styling the button element */
  className?: string;
  /** React child elements rendered inside the sign-in button */
  children?: React.ReactNode;
}

/**
 * A sign-in form action button component.
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