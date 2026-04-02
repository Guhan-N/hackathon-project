import React from 'react';
import { Info, RotateCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught fatal error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
          <div className="w-full max-w-md bg-white border border-red-100 rounded-3xl shadow-2xl p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <Info size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900">Application Error</h1>
              <p className="text-sm text-gray-500 line-clamp-3">
                {this.state.error?.message || 'A critical rendering error occurred.'}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
              >
                <RotateCw size={18} />
                Refresh Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
