import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-lime font-mono text-7xl font-semibold">404</p>
        <h1 className="mt-4 text-2xl font-semibold">This page flatlined</h1>
        <p className="text-ink-400 mt-2">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="text-lime mt-6 inline-block font-medium hover:underline">
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
