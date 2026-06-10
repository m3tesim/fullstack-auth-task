import type { ReactNode } from 'react';

interface SubmitButtonProps {
  isLoading: boolean;
  children: ReactNode;
}

export function SubmitButton({ isLoading, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? 'Please wait…' : children}
    </button>
  );
}
