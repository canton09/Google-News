import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process.env.API_KEY for the user provided key
// In a production environment, this should be handled by the build system/env files.
// We attach it to window.process to ensure the strictly typed SDK usage works correctly.
(window as any).process = {
  env: {
    API_KEY: 'AIzaSyADIRszR0qB5Vu2_YgoY2E6e7dxyk00-RY'
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);