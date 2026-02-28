import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-danger text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-secondary mb-2">
                حدث خطأ غير متوقع
              </h1>
              <p className="text-gray-600 mb-6">
                نأسف لهذا الخطأ. يرجى المحاولة مرة أخرى.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                إعادة التحميل
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
