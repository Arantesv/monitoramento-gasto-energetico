import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CATEGORIAS, getCategoriaInfo } from '../../constants';
import { Trash2, Edit2 } from 'lucide-react';

export default function ComodoModal({ comodo, onClose, aparelhosDoComodo }) {
  const { adicionarAparelho, editarAparelho, deletarAparelho } = useData();
  
  const [editingAparelho, setEditingAparelho] = useState(null);
  const [novoAparelho, setNovoAparelho] = useState({
    nome: '',
    categoria: 'outros',
    potencia_watts: '',
    horas_uso_dia: ''
  });

  const handleAddAparelho = () => {
    adicionarAparelho(novoAparelho, comodo.id);
    setNovoAparelho({ nome: '', categoria: 'outros', potencia_watts: '', horas_uso_dia: '' });
  };
  
  const handleEditAparelho = () => {
    editarAparelho(editingAparelho);
    setEditingAparelho(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Aparelhos - {comodo.nome}</h3>
            <button
              onClick={() => {
                onClose();
                setEditingAparelho(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Formulário de Adicionar/Editar Aparelho */}
          <div className="mb-6 space-y-3 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold">{editingAparelho ? 'Editar Aparelho' : 'Adicionar Novo Aparelho'}</h4>
            <input
              type="text"
              placeholder="Nome do aparelho"
              value={editingAparelho ? editingAparelho.aparelho : novoAparelho.nome}
              onChange={(e) => editingAparelho ? 
                setEditingAparelho({ ...editingAparelho, aparelho: e.target.value }) : 
                setNovoAparelho({ ...novoAparelho, nome: e.target.value })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
            />
            <select
              value={editingAparelho ? editingAparelho.categoria : novoAparelho.categoria}
              onChange={(e) => editingAparelho ?
                setEditingAparelho({ ...editingAparelho, categoria: e.target.value }) :
                setNovoAparelho({ ...novoAparelho, categoria: e.target.value })}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
            >
              {Object.entries(CATEGORIAS).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.nome}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Potência (Watts)"
                value={editingAparelho ? editingAparelho.potencia_watts : novoAparelho.potencia_watts}
                onChange={(e) => editingAparelho ?
                    setEditingAparelho({ ...editingAparelho, potencia_watts: e.target.value }) :
                    setNovoAparelho({ ...novoAparelho, potencia_watts: e.target.value })}
                className="px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Horas/dia"
                value={editingAparelho ? editingAparelho.horas_uso_dia : novoAparelho.horas_uso_dia}
                onChange={(e) => editingAparelho ?
                    setEditingAparelho({ ...editingAparelho, horas_uso_dia: e.target.value }) :
                    setNovoAparelho({ ...novoAparelho, horas_uso_dia: e.target.value })}
                className="px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
              />
            </div>
            {editingAparelho ? (
                 <div className="flex gap-2">
                    <button
                        onClick={handleEditAparelho}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Salvar
                    </button>
                    <button
                        onClick={() => setEditingAparelho(null)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                 </div>
            ) : (
                <button
                    onClick={handleAddAparelho}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Adicionar Aparelho
                </button>
            )}
          </div>

          {/* Lista de Aparelhos */}
          <div className="space-y-3">
            {aparelhosDoComodo.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhum aparelho cadastrado neste cômodo.</p>
            )}
            {aparelhosDoComodo.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded border">
                {/* Visualização Padrão */}
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{getCategoriaInfo(item.categoria).icon}</span>
                      <div>
                        <p className="font-medium text-lg">{item.aparelho}</p>
                        <p className="text-sm text-gray-500">
                          {getCategoriaInfo(item.categoria).nome} • {item.potencia_watts}W • {item.horas_uso_dia}h/dia
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Consumo: {parseFloat(item.consumo_mensal_kwh).toFixed(2)} kWh/mês
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-green-600">
                        R$ {parseFloat(item.custo_mensal_reais).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">mês</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setEditingAparelho(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deletarAparelho(item.aparelho_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Deletar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}