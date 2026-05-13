import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  inputSize?: InputSize;
  success?: boolean;
}

const sizeClass: Record<InputSize, string> = {
  sm: 'h-10 min-h-10 text-base md:h-8 md:min-h-0 md:text-sm',
  md: '',
  lg: 'h-12 min-h-12 text-base md:h-11 md:min-h-0',
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    icon,
    rightIcon,
    prefix,
    suffix,
    inputSize = 'md',
    success = false,
    className = '',
    id,
    required,
    ...props
  },
  ref
) {
  const reactId = useId();
  const inputId = id || `input-${reactId}`;
  const stateClass = error ? 'input-error' : success ? 'input-success' : '';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-neutral-700 mb-1.5"
        >
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-stretch">
        {prefix && (
          <span className="inline-flex items-center px-3 text-sm text-neutral-500 bg-neutral-50 border border-r-0 border-neutral-200 rounded-l-md">
            {prefix}
          </span>
        )}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`input ${sizeClass[inputSize]} ${icon ? 'pl-10' : ''} ${
            rightIcon ? 'pr-10' : ''
          } ${prefix ? 'rounded-l-none' : ''} ${suffix ? 'rounded-r-none' : ''} ${stateClass} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
            {rightIcon}
          </div>
        )}
        {suffix && (
          <span className="inline-flex items-center px-3 text-sm text-neutral-500 bg-neutral-50 border border-l-0 border-neutral-200 rounded-r-md">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
