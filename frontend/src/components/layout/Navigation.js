import React from 'react';
import { Home, Zap, BarChart3, TrendingUp } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, onTabClick }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'comparativo', label: 'Comparativos', icon: TrendingUp },
    { id: 'ia', label: 'Análise IA', icon: Zap },
    { id: 'comodos', label: 'Cômodos', icon: Home }
  ];

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (onTabClick) {
                  onTabClick(tab.id);
                }
              }}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}