import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, type, className, ...props }, ref) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';
    const inputId = id ?? props.name;
    const inputType = isPasswordField && passwordVisible ? 'text' : type;

    const inputClassName = [
      'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2',
      isPasswordField ? 'pr-10' : '',
      error
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <div className={isPasswordField ? 'relative' : undefined}>
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            aria-invalid={Boolean(error)}
            className={inputClassName}
            {...props}
          />
          {isPasswordField ? (
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              aria-pressed={passwordVisible}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
