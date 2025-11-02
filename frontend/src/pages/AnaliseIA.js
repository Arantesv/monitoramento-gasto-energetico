import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

export default function AnaliseIA() {
  const { analiseIA, loadingIA, carregarAnaliseIA } = useData();

  if (loadingIA) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Analisando seu consumo com IA...</p>
      </div>
    );
  }

  if (!analiseIA) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <Zap size={48} className="mx-auto text-green-600 mb-4" />
        <p className="text-gray-600 mb-4">Clique no botão para gerar análise com IA</p>
        <button
          onClick={carregarAnaliseIA}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Gerar Análise IA
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Análise Inteligente de Consumo</h2>
            <p className="text-lg">{analiseIA.resumo}</p>
            {analiseIA.total_economia_potencial_reais > 0 && (
              <p className="text-xl font-semibold mt-3">
                💰 Economia potencial: R$ {analiseIA.total_economia_potencial_reais.toFixed(2)}/mês
              </p>
            )}
          </div>
          <button
            onClick={carregarAnaliseIA}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Gráficos de Análise IA (Versão corrigida com 2 gráficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico da Esquerda: Custo em Reais (R$) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Custo Real vs. Expectativa (R$)</h3>
          <p className="text-sm text-gray-500 mb-4">Seu custo atual comparado à estimativa da IA.</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={analiseIA.analise_por_comodo}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="comodo" stroke="#333" />
              <YAxis
                tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                stroke="#333"
                width={50}
              />
              <Tooltip
                formatter={(value, name) => [`R$ ${value.toFixed(2)}`, name]}
                labelStyle={{ color: '#000' }}
                wrapperStyle={{ border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '10px' }}
                iconType="circle"
              />
              <Bar
                dataKey="consumo_atual_reais"
                name="Seu Custo Real"
                fill="#ef4444" // Vermelho (Alerta)
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expectativa_reais"
                name="Custo Esperado (IA)"
                fill="#10b981" // Verde (Meta)
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico da Direita: Consumo em kWh */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Consumo Real vs. Expectativa (kWh)</h3>
          <p className="text-sm text-gray-500 mb-4">Seu consumo atual comparado à estimativa da IA.</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={analiseIA.analise_por_comodo}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="comodo" stroke="#333" />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)} kWh`}
                stroke="#333"
                width={50}
              />
              <Tooltip
                formatter={(value, name) => [`${value.toFixed(2)} kWh`, name]}
                labelStyle={{ color: '#000' }}
                wrapperStyle={{ border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: '10px' }}
                iconType="circle"
              />
              <Bar
                dataKey="consumo_atual_kwh"
                name="Seu Consumo Real"
                fill="#3b82f6" // Azul (Real)
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expectativa_kwh"
                name="Consumo Esperado (IA)"
                fill="#a0aec0" // Cinza (Base/Meta)
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Cards de Dicas por Cômodo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analiseIA.analise_por_comodo && analiseIA.analise_por_comodo.length > 0 ? (
          analiseIA.analise_por_comodo.map((comodo, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">{comodo.comodo}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${comodo.percentual_acima > 20 ? 'bg-red-100 text-red-600' :
                    comodo.percentual_acima > 0 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                  }`}>
                  {comodo.percentual_acima > 0 ? '+' : ''}{comodo.percentual_acima}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Consumo Atual</p>
                  <p className="text-xl font-bold text-red-600">{comodo.consumo_atual_kwh} kWh</p>
                  <p className="text-sm text-gray-600">R$ {comodo.consumo_atual_reais.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expectativa IA</p>
                  <p className="text-xl font-bold text-green-600">{comodo.expectativa_kwh} kWh</p>
                  <p className="text-sm text-gray-600">R$ {comodo.expectativa_reais.toFixed(2)}</p>
                </div>
              </div>

              {comodo.economia_potencial_reais > 0 && (
                <div className="bg-yellow-50 p-3 rounded mb-3">
                  <p className="text-sm font-medium text-yellow-800">
                    💡 Economia possível: R$ {comodo.economia_potencial_reais.toFixed(2)}/mês
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Dicas da IA:</p>
                {comodo.dicas.map((dica, i) => (
                  <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    {dica}
                  </p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-yellow-50 p-6 rounded-lg text-center">
            <p className="text-yellow-800">Nenhum dado disponível para análise. Adicione cômodos e aparelhos primeiro.</p>
          </div>
        )}
      </div>
    </div>
  );
}