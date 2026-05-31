import { Component } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught error:', error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-3xl border border-red-200 bg-white p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-sm text-gray-600">
                The application encountered an error. Refresh the page or try again.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {this.state.error?.message || 'Unexpected application error.'}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
            <button
              onClick={this.reset}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }
}
