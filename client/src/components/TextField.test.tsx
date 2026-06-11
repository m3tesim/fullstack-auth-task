import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './TextField';

describe('TextField password visibility', () => {
  it('renders a show-password toggle only for password inputs', () => {
    render(<TextField label="Email" type="email" name="email" />);
    expect(
      screen.queryByRole('button', { name: 'Show password' }),
    ).not.toBeInTheDocument();

    render(<TextField label="Password" type="password" name="password" />);
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument();
  });

  it('toggles the input type between password and text', async () => {
    const user = userEvent.setup();
    render(<TextField label="Password" type="password" name="password" />);

    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: 'Show password' });

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
