import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { SignupForm } from '../components/SignupForm';

export function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
