import React from 'react';
import { Home, Trash2 } from 'lucide-react';

export default function ComodoCard({ comodo, onDelete, onManage }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded">
            <Home className="text-blue-600" size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{comodo.nome}</h4>
            <p className="text-sm text-gray-500">{comodo.descricao}</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
          title="Deletar Cômodo"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <button
        onClick={onManage}
        className="w-full px-4 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
      >
        Gerenciar Aparelhos
      </button>
    </div>
  );
}