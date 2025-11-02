import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap, LogOut } from 'lucide-react';

export default function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={32} />
            <div>
              <h1 className="text-2xl font-bold">Monitor de Energia</h1>
              <p className="text-green-100 text-sm">Consumo consciente e sustentável</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-green-100">Bem-vindo,</p>
              <p className="font-semibold">{usuario.nome}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}