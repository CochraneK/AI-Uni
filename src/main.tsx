import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './App.tsx';
import './index.css';
import 'uplot/dist/uPlot.min.css';
import 'react-toastify/dist/ReactToastify.css';
import ConvexClientProvider from './components/ConvexClientProvider.tsx';
import DemoApp from './demo/DemoApp.tsx';

const hasConvexBackend = Boolean(import.meta.env.VITE_CONVEX_URL);
const forceDemoMode = import.meta.env.VITE_DEMO_MODE === '1';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {hasConvexBackend && !forceDemoMode ? (
      <ConvexClientProvider>
        <Home />
      </ConvexClientProvider>
    ) : (
      <DemoApp />
    )}
  </React.StrictMode>,
);
