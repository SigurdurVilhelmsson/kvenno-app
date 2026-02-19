import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * @example With custom fallback
 * <ErrorBoundary fallback={<CustomErrorScreen />}>
 *   <App />
 * </ErrorBoundary>
 *
 * @example With error handler
 * <ErrorBoundary onError={(error, errorInfo) => logToService(error, errorInfo)}>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send error to a logging service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#f8f9fa',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#e74c3c',
                marginBottom: '1rem',
              }}
            >
              Villa kom upp / An Error Occurred
            </h1>

            <p style={{ marginBottom: '1rem', color: '#555' }}>
              Eitthvað fór úrskeiðis. Vinsamlegast endurhlaðið síðuna.
            </p>

            <p style={{ marginBottom: '1.5rem', color: '#555' }}>
              Something went wrong. Please reload the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginBottom: '1rem' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    padding: '0.5rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.25rem',
                    fontWeight: 'bold',
                  }}
                >
                  Error Details (Development Only)
                </summary>
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.25rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  <strong>Error:</strong> {this.state.error.message}
                  {this.state.errorInfo && (
                    <>
                      <br />
                      <br />
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </div>
              </details>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f36b22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Endurhlaða / Reload
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Reyna aftur / Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to manually trigger error boundary
 * Useful for testing error boundaries
 *
 * @example
 * const throwError = useErrorHandler();
 * <button onClick={() => throwError(new Error('Test error'))}>
 *   Trigger Error
 * </button>
 */
export const useErrorHandler = () => {
  return (error: Error) => {
    throw error;
  };
};
