import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SigninForm } from './SigninForm';

const signInMock = vi.fn<(values: unknown) => Promise<void>>();
const navigateMock = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: vi.fn(),
    signIn: signInMock,
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
      <SigninForm />
    </MemoryRouter>,
  );
}

describe('SigninForm', () => {
  beforeEach(() => {
    signInMock.mockReset();
    signInMock.mockResolvedValue(undefined);
    navigateMock.mockReset();
  });

  it('renders the Email, Password fields, visibility toggle, and submit button', () => {
    renderForm();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows inline validation errors when an empty form is submitted', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Please enter a valid email address'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Password is required'),
    ).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it('shows an email validation error for a malformed address', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'Passw0rd!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Please enter a valid email address'),
    ).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it('submits valid credentials and redirects to the dashboard', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'Passw0rd!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledTimes(1);
    });
    expect(signInMock).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'Passw0rd!',
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });
});
