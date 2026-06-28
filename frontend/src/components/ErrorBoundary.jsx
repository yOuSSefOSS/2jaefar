import React from 'react';
import HolographicErrorLayout from './HolographicErrorLayout';
import { RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
    try {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'errorBoundary', error: String(error), stack: errorInfo.componentStack })
      }).catch(()=>{});
    } catch(e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <HolographicErrorLayout imageSrc="/ERROR 500.jpg" glowColor="amber">
          {import.meta.env.DEV && (
            <div className="hidden lg:block absolute bottom-full left-0 w-full text-left bg-black/80 p-4 rounded-xl overflow-auto text-xs text-red-400 font-mono mb-4 border border-red-500/50 max-h-48 backdrop-blur-md">
              <p>{this.state.error && this.state.error.toString()}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-amber-500/20 text-white border border-amber-500/40 hover:bg-amber-500/40 hover:border-amber-500/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.3)] font-semibold uppercase tracking-wider text-sm"
            >
              <RefreshCw size={18} />
              <span>Restart Sequence</span>
            </button>
            <a 
              href="/"
              className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)] font-semibold uppercase tracking-wider text-sm"
            >
              <Home size={18} />
              <span>Return to Base</span>
            </a>
          </div>
        </HolographicErrorLayout>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
