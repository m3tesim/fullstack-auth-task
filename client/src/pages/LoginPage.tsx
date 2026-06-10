import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { SigninForm } from '../components/SigninForm';

export function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </>
      }
    >
      <SigninForm />
    </AuthCard>
  );
}
