import clsx from 'clsx'
import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-lime text-ink-950 hover:bg-[#d4f77a] shadow-[0_0_24px_-6px_rgb(198_242_78/0.6)] font-semibold',
  secondary: 'bg-ink-700 text-ink-100 hover:bg-ink-600 border border-ink-600',
  ghost: 'text-ink-300 hover:text-ink-100 hover:bg-ink-800',
  danger: 'bg-down/10 text-down hover:bg-down/20 border border-down/30',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </motion.button>
  )
}
