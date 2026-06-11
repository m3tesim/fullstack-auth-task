import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SignupForm } from './SignupForm';

// Spy that stands in for the real signup submission action.
const signUpMock = vi.fn<(values: unknown) => Promise<void>>();
const navigateMock = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: signUpMock,
    signIn: vi.fn(),
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

function renderForm() {
  return render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>,
  );
}

describe('SignupForm', () => {
  beforeEach(() => {
    signUpMock.mockReset();
    signUpMock.mockResolvedValue(undefined);
    navigateMock.mockReset();
  });

  it('renders the Name, Email, Password fields, visibility toggle, and submit button', () => {
    renderForm();

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create account' }),
    ).toBeInTheDocument();
  });

  it('shows inline name and email validation errors when an empty form is submitted', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('Name must be at least 3 characters long'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Please enter a valid email address'),
    ).toBeInTheDocument();

    // A blocked (invalid) submit must not trigger the submission action.
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      password: 'abcdefgh',
      message: 'Password must contain at least one number',
    },
    {
      password: '12345678!',
      message: 'Password must contain at least one letter',
    },
    {
      password: 'abcdefgh1',
      message: 'Password must contain at least one special character',
    },
    {
      password: 'abc1!',
      message: 'Password must be at least 8 characters long',
    },
  ])(
    'shows "$message" for password "$password" and blocks submission',
    async ({ password, message }) => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.type(screen.getByLabelText('Password'), password);
      await user.click(screen.getByRole('button', { name: 'Create account' }));

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(signUpMock).not.toHaveBeenCalled();
    },
  );

  it('toggles password visibility without clearing the field value', async () => {
    const user = userEvent.setup();
    renderForm();

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'Passw0rd!');
    await user.click(screen.getByRole('button', { name: 'Show password' }));

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(passwordInput).toHaveValue('Passw0rd!');
  });

  it('submits valid data: clears errors and calls the signup action once', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passw0rd!');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledTimes(1);
    });
    expect(signUpMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Passw0rd!',
    });

    // No validation error text should remain on a fully valid submission.
    expect(
      screen.queryByText('Name must be at least 3 characters long'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Please enter a valid email address'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Password must/),
    ).not.toBeInTheDocument();

    // On success the user is redirected to the dashboard.
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });
});
