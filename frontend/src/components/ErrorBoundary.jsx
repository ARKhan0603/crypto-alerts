import { Component } from 'react'
import Button from './ui/Button'

/** Catches render errors in its subtree, including a failed lazy-loaded chunk. */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div role="alert" className="grid min-h-screen place-items-center px-6 text-center">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-ink-400 text-sm">
            The page failed to load. Check your connection and try again.
          </p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    )
  }
}
