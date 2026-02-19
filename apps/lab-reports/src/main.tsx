/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance, initializeMsal } from './utils/msalInstance';
import { AuthGuard } from './components/AuthGuard';
import { AuthCallback } from './components/AuthCallback';
import { Landing } from './components/Landing';
import { TeacherPage } from './pages/TeacherPage';
import { Teacher2Page } from './pages/Teacher2Page';
import { StudentPage } from './pages/StudentPage';
import './index.css';

// Check environment variable for mode locking
const appModeConfig = import.meta.env.VITE_APP_MODE || 'dual'; // 'dual', 'teacher', or 'student'

function App() {
  // Get base path from environment or use default
  const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';

  // Check if we're on the auth callback route (no basename prefix)
  // This handles the centralized /auth/callback endpoint
  if (window.location.pathname === '/auth/callback') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // If mode is locked, redirect to appropriate page
  if (appModeConfig === 'teacher') {
    return (
      <BrowserRouter basename={basePath}>
        <AuthGuard>
          <Routes>
            <Route path="/*" element={<TeacherPage />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    );
  }

  if (appModeConfig === 'student') {
    return (
      <BrowserRouter basename={basePath}>
        <AuthGuard>
          <Routes>
            <Route path="/*" element={<StudentPage />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    );
  }

  // Dual mode - show landing and allow navigation
  return (
    <BrowserRouter basename={basePath}>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/teacher/*" element={<TeacherPage />} />
          <Route path="/teacher-2ar/*" element={<Teacher2Page />} />
          <Route path="/student/*" element={<StudentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

// Initialize MSAL before rendering
initializeMsal().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>
  );
});
