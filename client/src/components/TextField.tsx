import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
          }`}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
