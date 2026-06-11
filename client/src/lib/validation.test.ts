import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema } from './validation';

const validSignUp = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Passw0rd!',
};

describe('signUpSchema', () => {
  it('accepts valid signup data', () => {
    expect(signUpSchema.safeParse(validSignUp).success).toBe(true);
  });

  it.each([
    {
      field: 'name',
      value: 'Al',
      message: 'Name must be at least 3 characters long',
    },
    {
      field: 'email',
      value: 'not-an-email',
      message: 'Please enter a valid email address',
    },
    {
      field: 'password',
      value: 'abc1!',
      message: 'Password must be at least 8 characters long',
    },
    {
      field: 'password',
      value: '12345678!',
      message: 'Password must contain at least one letter',
    },
    {
      field: 'password',
      value: 'abcdefgh!',
      message: 'Password must contain at least one number',
    },
    {
      field: 'password',
      value: 'abcdefgh1',
      message: 'Password must contain at least one special character',
    },
  ])('rejects invalid $field: $value', ({ field, value, message }) => {
    const result = signUpSchema.safeParse({
      ...validSignUp,
      [field]: value,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path[0] === field);
      expect(issue?.message).toBe(message);
    }
  });
});

describe('signInSchema', () => {
  const validSignIn = {
    email: 'jane@example.com',
    password: 'Passw0rd!',
  };

  it('accepts valid signin data', () => {
    expect(signInSchema.safeParse(validSignIn).success).toBe(true);
  });

  it.each([
    {
      field: 'email',
      value: 'not-an-email',
      message: 'Please enter a valid email address',
    },
    {
      field: 'password',
      value: '',
      message: 'Password is required',
    },
  ])('rejects invalid $field', ({ field, value, message }) => {
    const result = signInSchema.safeParse({
      ...validSignIn,
      [field]: value,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path[0] === field);
      expect(issue?.message).toBe(message);
    }
  });
});
