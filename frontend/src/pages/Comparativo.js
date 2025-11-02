import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Users, MapPin } from 'lucide-react';

export default function Comparativo() {
  const { totais, mediaGeral, mediaBrasil } = useData();

  const comparativoData = [
    {
      categoria: 'Você',
      kwh: parseFloat(totais.kwh),
      reais: parseFloat(totais.reais)
    },
    {
      categoria: 'Média Usuários',
      kwh: parseFloat(mediaGeral?.media_consumo_kwh || 0),
      reais: parseFloat(mediaGeral?.media_custo_reais || 0)
    },
    {
      categoria: 'Média Brasil',
      kwh: mediaBrasil?.media_consumo_kwh || 152,
      reais: mediaBrasil?.media_custo_reais || 98.80
    }
  ];

  const cardColors = {
    'Você': '#3b82f6', // Azul (do Card 1)
    'Média Usuários': '#10b981', // Verde (do Card 2)
    'Média Brasil': '#f97316' // Laranja (do Card 3)
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <User size={24} />
            <h3 className="text-lg font-semibold">Seu Consumo</h3>
          </div>
          <p className="text-3xl font-bold">{totais.kwh} kWh</p>
          <p className="text-xl mt-2">R$ {totais.reais}</p>
          <p className="text-sm opacity-90 mt-1">{totais.watts} Watts instalados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Users size={24} />
            <h3 className="text-lg font-semibold">Média dos Usuários</h3>
          </div>
          <p className="text-3xl font-bold">
            {mediaGeral?.media_consumo_kwh ? parseFloat(mediaGeral.media_consumo_kwh).toFixed(2) : '0.00'} kWh
          </p>
          <p className="text-xl mt-2">
            R$ {mediaGeral?.media_custo_reais ? parseFloat(mediaGeral.media_custo_reais).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm opacity-90 mt-1">Plataforma Monitor de Energia</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <MapPin size={24} />
            <h3 className="text-lg font-semibold">Média Brasil</h3>
          </div>
          <p className="text-3xl font-bold">{mediaBrasil?.media_consumo_kwh || 152} kWh</p>
          <p className="text-xl mt-2">R$ {mediaBrasil?.media_custo_reais || 98.80}</p>
          <p className="text-sm opacity-90 mt-1">{mediaBrasil?.fonte || 'EPE 2024'}</p>
        </div>
      </div>

      {/* Gráficos de Comparativo (Versão corrigida com 2 gráficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico da Esquerda: Consumo (kWh) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Comparativo de Consumo (kWh)</h3>
          <p className="text-sm text-gray-500 mb-4">Seu consumo em kWh contra as médias.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={comparativoData}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="categoria" stroke="#333" />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)} kWh`}
                stroke="#333"
                width={60}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value.toFixed(2)} kWh`,
                  props.payload.categoria
                ]}
                labelFormatter={() => ''} // O X-axis já diz o que é
                wrapperStyle={{ border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' }}
              />
              <Bar dataKey="kwh" name="Consumo (kWh)">
                {comparativoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cardColors[entry.categoria]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico da Direita: Custo (R$) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Comparativo de Custo (R$)</h3>
          <p className="text-sm text-gray-500 mb-4">Seu custo em R$ contra as médias.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={comparativoData}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="categoria" stroke="#333" />
              <YAxis
                tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                stroke="#333"
                width={60}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `R$ ${value.toFixed(2)}`,
                  props.payload.categoria
                ]}
                labelFormatter={() => ''}
                wrapperStyle={{ border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' }}
              />
              <Bar dataKey="reais" name="Custo (R$)">
                {comparativoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cardColors[entry.categoria]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}