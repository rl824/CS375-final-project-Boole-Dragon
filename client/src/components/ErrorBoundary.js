import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050e07',
          color: '#f5f8f4',
          padding: '20px',
          fontFamily: 'system-ui'
        }}>
          <div style={{
            maxWidth: '500px',
            background: '#121f18',
            border: '1px solid #1f2c21',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 16px' }}>⚠️</h1>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.5rem' }}>Something went wrong</h2>
            <p style={{ color: '#95a59a', marginBottom: '24px' }}>
              The app encountered an unexpected error. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#29a867',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#95a59a' }}>Error Details</summary>
                <pre style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#0d1510',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  color: '#ff6b6b'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
