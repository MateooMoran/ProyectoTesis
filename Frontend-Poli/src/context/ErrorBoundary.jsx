import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-blue-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-700 mb-4">Algo salió mal</h2>
            <p className="text-gray-700 mb-6">{this.state.error?.message || 'Ocurrió un error inesperado.'}</p>
            <button
              className="bg-blue-800 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-800 transition-colors"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;