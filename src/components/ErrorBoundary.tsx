import { Component, type ErrorInfo, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, RefreshIcon, Home01Icon } from '@hugeicons/core-free-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Application Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#050505] text-zinc-100 font-mono select-none">
          <div className="w-full max-w-md p-6 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
              <HugeiconsIcon icon={AlertCircleIcon} size={26} />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Application Exception Caught</h2>
              <p className="text-xs text-zinc-400">
                An unexpected runtime error occurred. The application recovered safely to prevent data loss.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] text-rose-300 text-left font-mono break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm"
              >
                <HugeiconsIcon icon={RefreshIcon} size={14} />
                <span>Reload Application</span>
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs hover:bg-zinc-800 cursor-pointer"
              >
                <HugeiconsIcon icon={Home01Icon} size={14} />
                <span>Home Page</span>
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
