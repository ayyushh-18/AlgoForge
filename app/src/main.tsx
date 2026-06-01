import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

// Fire-and-forget background ping to wake up the backend (Render cold start optimization)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://algoforge-2-0.onrender.com';
fetch(`${API_BASE_URL}/api/health`).catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="7270664839-fu1jalheli35hihlhqq04ubedd05pe2b.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
