'use client';

import { SelectHTMLAttributes, forwardRef, useId } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  hint?: string;
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, hideLabel, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className={hideLabel ? 'sr-only' : 'text-sm font-medium text-ink-700'}>
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`rounded-md border bg-surface px-3 py-2 text-sm text-ink-900 focus-visible:border-accent ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';
