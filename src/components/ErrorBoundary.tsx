import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Typing Test Error:', error);
    console.error('Error Info:', errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please refresh the page to try again
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;