import React from 'react';

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
        <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4 relative overflow-hidden">
           <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-brand-900 to-brand-900"></div>
           <div className="premium-glass p-8 md:p-12 max-w-2xl w-full text-center relative z-10 border-t-4 border-t-amber-500/50">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-4 tracking-tight">SYSTEM OVERRIDE</h1>
              <p className="text-edu-text-muted mb-8 leading-relaxed">A critical avionics failure has occurred.</p>
              
              {/* Optional: Show error details in development */}
              {import.meta.env.DEV && (
                <div className="text-left bg-black/40 p-4 rounded-xl overflow-auto text-xs text-red-400 font-mono mb-8 border border-red-500/20 max-h-48">
                  <p>{this.state.error && this.state.error.toString()}</p>
                </div>
              )}

              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all font-semibold tracking-wide w-full sm:w-auto"
              >
                Reboot System
              </button>
           </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
