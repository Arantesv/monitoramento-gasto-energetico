import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getCategoriaInfo } from '../constants';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Zap, BarChart3, DollarSign, TrendingDown } from 'lucide-react';

export default function Dashboard() {
  const { consumoData, relatorioMensal, categoriasData, mediaGeral, mediaBrasil, comodos, totais } = useData();
  const { usuario } = useAuth();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Olá, {usuario.nome}! 👋</h2>
            <p className="text-green-100 text-lg">Veja um resumo do seu consumo energético</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{totais.kwh}</div>
            <div className="text-green-100">kWh este mês</div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card Consumo Total */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Zap className="text-blue-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">{totais.kwh}</p>
              <p className="text-sm text-gray-500">kWh/mês</p>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Consumo Total</p>
        </div>
        {/* Card Custo Estimado */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">{totais.reais}</p>
              <p className="text-sm text-gray-500">Reais/mês</p>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Custo Estimado</p>
        </div>
        {/* Card Cômodos */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Home className="text-purple-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">{comodos.length}</p>
              <p className="text-sm text-gray-500">Cômodos</p>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Total Monitorado</p>
        </div>
        {/* Card Aparelhos */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Zap className="text-orange-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">{consumoData.length}</p>
              <p className="text-sm text-gray-500">Aparelhos</p>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Total Cadastrado</p>
        </div>
      </div>

      {/* Consumo por Categoria */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={24} className="text-green-600" />
          Consumo por Categoria
        </h3>
        {categoriasData && categoriasData.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {categoriasData.map((cat, idx) => {
                const catInfo = getCategoriaInfo(cat.categoria);
                return (
                  <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{catInfo.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{catInfo.nome}</p>
                        <p className="text-xs text-gray-500">{cat.total_aparelhos} aparelhos</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-2xl font-bold" style={{ color: catInfo.cor }}>
                        {parseFloat(cat.consumo_mensal_kwh || 0).toFixed(1)} kWh
                      </p>
                      <p className="text-sm text-gray-600">R$ {parseFloat(cat.custo_mensal_reais || 0).toFixed(2)}/mês</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoriasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoria"
                  tickFormatter={(value) => getCategoriaInfo(value).nome}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => getCategoriaInfo(value).nome}
                  formatter={(value) => [parseFloat(value).toFixed(2) + ' kWh', 'Consumo']}
                />
                <Bar dataKey="consumo_mensal_kwh" radius={[8, 8, 0, 0]}>
                  {categoriasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoriaInfo(entry.categoria).cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum aparelho cadastrado ainda.</p>
            <p className="text-sm mt-2">Adicione aparelhos em "Cômodos" para ver as estatísticas por categoria.</p>
          </div>
        )}
      </div>

      {/* Consumo por Cômodo e Maiores Consumidores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Consumo por Cômodo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={relatorioMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="comodo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consumo_mensal_kwh" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top 5 Maiores Consumidores</h3>
          {consumoData && consumoData.length > 0 ? (
            <div className="space-y-3">
              {consumoData.slice(0, 5).map((item, index) => {
                const catInfo = getCategoriaInfo(item.categoria);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{catInfo.icon}</div>
                      <div>
                        <p className="font-medium">{item.aparelho}</p>
                        <p className="text-sm text-gray-500">{item.comodo} • {catInfo.nome}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {parseFloat(item.consumo_mensal_kwh).toFixed(1)} kWh
                      </p>
                      <p className="text-sm text-gray-500">R$ {parseFloat(item.custo_mensal_reais).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum aparelho cadastrado ainda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dicas de Economia */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
        <div className="flex items-start gap-4">
          <TrendingDown size={32} className="flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold mb-3">💡 Dicas Rápidas para Economizar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <p>✓ Desligue aparelhos em standby</p>
              <p>✓ Use LED em vez de incandescente</p>
              <p>✓ Evite horário de pico (18h-21h)</p>
              <p>✓ Mantenha geladeira bem vedada</p>
              <p>✓ Limpe filtros de ar condicionado</p>
              <p>✓ Aproveite luz natural sempre que possível</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}