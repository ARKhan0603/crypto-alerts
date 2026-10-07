export default function Alert({ children }) {
  if (!children) return null
  return (
    <div
      role="alert"
      className="border-down/30 bg-down/10 text-down rounded-xl border px-3.5 py-2.5 text-sm"
    >
      {children}
    </div>
  )
}
