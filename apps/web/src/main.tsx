import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './i18n';
import App from './App';
import './index.css';

// Suppress hydration warnings for nonce-related issues
const reportError = (error: unknown) => {
  // Filter out known benign hydration warnings
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('CspNonceProvider')) {
    return;
  }
  console.error(error);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement, {
  onRecoverableError: reportError,
}).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '16px',
            padding: '14px 18px',
            fontSize: '13.5px',
            fontWeight: '500',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
            maxWidth: '360px',
            letterSpacing: '0.01em',
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(34, 197, 94, 0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: 'rgba(15, 23, 42, 0.9)',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(239, 68, 68, 0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: 'rgba(15, 23, 42, 0.9)',
            },
          },
          loading: {
            style: {
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
            },
            iconTheme: {
              primary: '#6366f1',
              secondary: 'rgba(15, 23, 42, 0.9)',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
