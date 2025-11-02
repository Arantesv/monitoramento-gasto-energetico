import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginPage from './components/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (!token) {
    return <LoginPage />;
  }

  return (
    <DataProvider>
      <MainLayout />
    </DataProvider>
  );
}

export default App;