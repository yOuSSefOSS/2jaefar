import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'

import ErrorBoundary from './components/ErrorBoundary.jsx'

const originalError = console.error;
console.error = (...args) => {
  originalError(...args);
  try {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'console.error', args: args.map(a => String(a)) })
    }).catch(()=>{});
  } catch(e) {}
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
