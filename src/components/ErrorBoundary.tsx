import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Production'da analytics'e gönder
    if (import.meta.env.PROD && typeof window !== "undefined") {
      // Google Analytics
      if (window.gtag) {
        window.gtag("event", "exception", {
          description: error.message,
          fatal: false,
        });
      }

      // Sentry (eğer kuruluysa)
      // Sentry.captureException(error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/home";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bir Hata Oluştu
            </h1>
            <p className="text-gray-600 mb-6">
              Üzgünüz, bir şeyler ters gitti. Bu sorunu çözmek için çalışıyoruz.
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={this.handleReload}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sayfayı Yenile
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  🐛 Geliştirici Bilgisi (Sadece development'da görünür)
                </summary>
                <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-xs">
                  <p className="font-semibold text-red-800 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  <pre className="text-red-600 overflow-auto max-h-64 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <div className="mt-4">
                      <p className="font-semibold text-red-800 mb-2">
                        Component Stack:
                      </p>
                      <pre className="text-red-600 overflow-auto max-h-32 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// TypeScript globals extension
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
