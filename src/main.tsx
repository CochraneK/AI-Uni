import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './App.tsx';
import './index.css';
import 'uplot/dist/uPlot.min.css';
import 'react-toastify/dist/ReactToastify.css';
import ConvexClientProvider from './components/ConvexClientProvider.tsx';

const campusMode = new URLSearchParams(window.location.search).get('mode') === 'campus';
const app = <Home />;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {campusMode ? <ConvexClientProvider>{app}</ConvexClientProvider> : app}
  </React.StrictMode>,
);
