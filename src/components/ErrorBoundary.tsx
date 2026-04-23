import React from 'react';

/**
 * Root error boundary. Catches render-phase exceptions anywhere below it and
 * shows a recoverable fallback UI. Does NOT catch async errors (promise
 * rejections, event handlers); those are the call site's responsibility.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: (error: Error, reset: () => void) => React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface to the console so devs see a stack in the browser.
    // Real error tracking (Sentry etc.) would hook in here.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong.</h1>
            <p className="text-slate-600 mb-4 text-sm">
              The page ran into an unexpected error. Your work isn't lost — try reloading or going back home.
            </p>
            <pre className="bg-slate-100 rounded-md p-3 text-xs text-slate-700 overflow-x-auto mb-6 max-h-40 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.reset}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
