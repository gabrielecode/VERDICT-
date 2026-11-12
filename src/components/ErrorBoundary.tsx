import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Si è verificato un errore imprevisto
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Siamo spiacenti, qualcosa è andato storto nell'applicazione. Ricarica la pagina per riprovare.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Ricarica la pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
