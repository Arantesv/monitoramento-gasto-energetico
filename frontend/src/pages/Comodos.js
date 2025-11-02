import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus } from 'lucide-react';
import ComodoCard from '../components/comodos/ComodoCard';
import ComodoModal from '../components/comodos/ComodoModal';

export default function Comodos() {
  const { comodos, adicionarComodo, deletarComodo, consumoData } = useData();
  const [selectedComodo, setSelectedComodo] = useState(null);
  const [novoComodo, setNovoComodo] = useState({ nome: '', descricao: '' });

  const handleAddComodo = () => {
    adicionarComodo(novoComodo);
    setNovoComodo({ nome: '', descricao: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Adicionar Novo Cômodo</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nome do cômodo"
            value={novoComodo.nome}
            onChange={(e) => setNovoComodo({ ...novoComodo, nome: e.target.value })}
            className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={novoComodo.descricao}
            onChange={(e) => setNovoComodo({ ...novoComodo, descricao: e.target.value })}
            className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleAddComodo}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comodos.map(comodo => (
          <ComodoCard 
            key={comodo.id}
            comodo={comodo}
            onDelete={() => deletarComodo(comodo.id)}
            onManage={() => setSelectedComodo(comodo)}
          />
        ))}
      </div>

      {selectedComodo && (
        <ComodoModal
          comodo={selectedComodo}
          onClose={() => setSelectedComodo(null)}
          aparelhosDoComodo={consumoData.filter(item => item.comodo === selectedComodo.nome)}
        />
      )}
    </div>
  );
}