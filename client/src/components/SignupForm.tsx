import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { signUpSchema, type SignUpValues } from '../lib/validation';
import { getApiErrorMessage } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { TextField } from './TextField';
import { SubmitButton } from './SubmitButton';
import { FormAlert } from './FormAlert';

export function SignupForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signUp(values);
      navigate('/dashboard');
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to create your account.'));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={formError} />
      <TextField
        label="Name"
        type="text"
        autoComplete="name"
        placeholder="Jane Doe"
        error={errors.name?.message}
        {...register('name')}
      />
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
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <SubmitButton isLoading={isSubmitting}>Create account</SubmitButton>
    </form>
  );
}
