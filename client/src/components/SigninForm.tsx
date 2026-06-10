import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { signInSchema, type SignInValues } from '../lib/validation';
import { getApiErrorMessage } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { TextField } from './TextField';
import { SubmitButton } from './SubmitButton';
import { FormAlert } from './FormAlert';

export function SigninForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signIn(values);
      navigate('/dashboard');
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to sign you in.'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={formError} />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="jane@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <SubmitButton isLoading={isSubmitting}>Sign in</SubmitButton>
    </form>
  );
}
