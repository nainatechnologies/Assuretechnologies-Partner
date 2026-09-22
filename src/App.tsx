import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';


const AuthRedirect = () => {
  const token = localStorage.getItem('partner_token') || localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
};

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
            // Smoothly hide the splash screen once React mounts
      SplashScreen.hide().catch(() => {});

      // Android Hardware Back Button handling
      const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        const path = window.location.pathname;
        if (path === '/login' || path === '/dashboard' || path === '/') {
          CapApp.exitApp();
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        backListener.then((handle) => handle.remove()).catch(() => {});
      };
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthRedirect />} />
        <Route path="/login" element={<AuthRedirect />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Fallback route */}
        
        <Route path="*" element={<AuthRedirect />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
