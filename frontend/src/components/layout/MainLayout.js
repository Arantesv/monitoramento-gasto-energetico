import React, { useState, lazy, Suspense } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { useData } from '../../context/DataContext';

const Dashboard = lazy(() => import('../../pages/Dashboard'));
const Comparativo = lazy(() => import('../../pages/Comparativo'));
const AnaliseIA = lazy(() => import('../../pages/AnaliseIA'));
const Comodos = lazy(() => import('../../pages/Comodos'));

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { analiseIA, carregarAnaliseIA } = useData();

  const handleTabClick = (tabId) => {
    if (tabId === 'ia' && !analiseIA) {
      carregarAnaliseIA();
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'comparativo':
        return <Comparativo />;
      case 'ia':
        return <AnaliseIA />;
      case 'comodos':
        return <Comodos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onTabClick={handleTabClick} 
      />
      <main className="container mx-auto px-4 py-8">
        {/* Suspense é necessário para o lazy loading */}
        <Suspense fallback={<div className="text-center p-12">Carregando página...</div>}>
          {renderTabContent()}
        </Suspense>
      </main>
    </div>
  );
}