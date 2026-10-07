import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import './styles/marketing.css';
import './styles/auth-ledger.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { LocaleProvider } from './context/LocaleContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LocaleProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#1A1A1A',
                fontSize: '14px',
                borderRadius: '0',
                boxShadow: 'none',
              },
              success: { iconTheme: { primary: '#2A9D8F', secondary: '#fff' } },
              error: { duration: 5000, iconTheme: { primary: '#E76F51', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </LocaleProvider>
    </ErrorBoundary>
  </StrictMode>,
);
