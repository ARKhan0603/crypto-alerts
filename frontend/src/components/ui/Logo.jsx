export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#111720" stroke="#263140" />
        <path
          d="M6 21l6-7 5 4 9-10"
          fill="none"
          stroke="#c6f24e"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="26" cy="8" r="2.6" fill="#c6f24e" />
      </svg>
      <span className="text-xl font-semibold tracking-tight">Tickr</span>
    </span>
  )
}
