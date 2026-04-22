import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'Arial, sans-serif',
        }}>
          <h1 style={{ color: '#d32f2f' }}>⚠️ Something went wrong</h1>
          <div style={{
            background: '#ffebee',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
          }}>
            <h3>Error Details:</h3>
            <p style={{ color: '#c62828', fontWeight: 'bold' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            
            {this.state.error?.message?.includes('MetaMask') && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                padding: '15px',
                borderRadius: '4px',
                marginTop: '15px',
              }}>
                <h4>📌 Possible Solutions:</h4>
                <ol style={{ paddingLeft: '20px' }}>
                  <li>Make sure MetaMask extension is installed and enabled</li>
                  <li>Unlock your MetaMask wallet</li>
                  <li>Refresh the page after unlocking MetaMask</li>
                  <li>Check that MetaMask is not blocked by your browser</li>
                  <li>Try disabling other wallet extensions temporarily</li>
                </ol>
                <p style={{ marginTop: '10px' }}>
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    Download MetaMask →
                  </a>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={this.handleReload}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            🔄 Reload Page
          </button>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Stack Trace (Development)
              </summary>
              <pre style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
              }}>
                {this.state.error?.stack}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
