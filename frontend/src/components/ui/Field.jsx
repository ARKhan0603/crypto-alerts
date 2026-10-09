import clsx from 'clsx'
import { forwardRef, useId } from 'react'

/** Labelled input with inline error and optional leading adornment. */
const Field = forwardRef(function Field(
  { label, error, hint, prefix, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-ink-200 mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="text-ink-400 pointer-events-none absolute inset-y-0 left-3.5 flex items-center font-mono">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={clsx(
            'bg-ink-900 text-ink-100 h-11 w-full rounded-xl border px-3.5 transition-colors outline-none',
            'placeholder:text-ink-500 focus:border-lime/70 focus:ring-lime/10 focus:ring-4',
            prefix && 'pl-8 font-mono',
            error ? 'border-down/60' : 'border-ink-600',
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-down mt-1.5 text-sm">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-ink-400 mt-1.5 text-sm">
            {hint}
          </p>
        )
      )}
    </div>
  )
})

export default Field
