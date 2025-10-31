import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Home, Zap, Plus, Trash2, BarChart3, DollarSign, TrendingDown, Edit2, LogOut, User, TrendingUp, Users, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function MonitoramentoEnergia() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [registerData, setRegisterData] = useState({ nome: '', email: '', senha: '' });

  const [comodos, setComodos] = useState([]);
  const [consumoData, setConsumoData] = useState([]);
  const [relatorioMensal, setRelatorioMensal] = useState([]);
  const [categoriasData, setCategoriasData] = useState([]);
  const [analiseIA, setAnaliseIA] = useState(null);
  const [mediaGeral, setMediaGeral] = useState(null);
  const [mediaBrasil, setMediaBrasil] = useState(null);
  const [loadingIA, setLoadingIA] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedComodo, setSelectedComodo] = useState(null);
  const [editingAparelho, setEditingAparelho] = useState(null);

  const [novoComodo, setNovoComodo] = useState({ nome: '', descricao: '' });
  const [novoAparelho, setNovoAparelho] = useState({
    nome: '',
    categoria: 'outros',
    potencia_watts: '',
    horas_uso_dia: ''
  });

  const CATEGORIAS = {
    'climatizacao': { nome: 'Climatização', icon: '❄️', cor: '#3b82f6' },
    'iluminacao': { nome: 'Iluminação', icon: '💡', cor: '#fbbf24' },
    'eletrodomesticos': { nome: 'Eletrodomésticos', icon: '🔌', cor: '#10b981' },
    'entretenimento': { nome: 'Entretenimento', icon: '📺', cor: '#8b5cf6' },
    'higiene': { nome: 'Higiene', icon: '🚿', cor: '#ec4899' },
    'outros': { nome: 'Outros', icon: '⚡', cor: '#6b7280' }
  };

  useEffect(() => {
    if (token) {
      verificarToken();
    }
  }, [token]);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario]);

  const verificarToken = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      logout();
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUsuario(data.usuario);
      } else {
        alert(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      alert('Erro ao conectar com servidor');
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUsuario(data.usuario);
      } else {
        alert(data.error || 'Erro ao cadastrar');
      }
    } catch (error) {
      alert('Erro ao conectar com servidor');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  const carregarDados = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resComodos, resConsumo, resRelatorio, resCategorias, resMediaGeral, resMediaBrasil] = await Promise.all([
        fetch(`${API_URL}/comodos`, { headers }),
        fetch(`${API_URL}/consumo`, { headers }),
        fetch(`${API_URL}/relatorio/mensal`, { headers }),
        fetch(`${API_URL}/estatisticas/por-categoria`, { headers }),
        fetch(`${API_URL}/estatisticas/media-geral`, { headers }),
        fetch(`${API_URL}/estatisticas/media-brasil`, { headers })
      ]);

      const comodos = await resComodos.json();
      const consumo = await resConsumo.json();
      const relatorio = await resRelatorio.json();
      const categorias = await resCategorias.json();
      const mediaG = await resMediaGeral.json();
      const mediaB = await resMediaBrasil.json();

      setComodos(Array.isArray(comodos) ? comodos : []);
      setConsumoData(Array.isArray(consumo) ? consumo : []);
      setRelatorioMensal(Array.isArray(relatorio) ? relatorio : []);
      setCategoriasData(Array.isArray(categorias) ? categorias : []);
      setMediaGeral(mediaG || { media_consumo_kwh: 0, media_custo_reais: 0 });
      setMediaBrasil(mediaB || { media_consumo_kwh: 152, media_custo_reais: 98.80 });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setComodos([]);
      setConsumoData([]);
      setRelatorioMensal([]);
      setCategoriasData([]);
    }
  };

  const carregarAnaliseIA = async () => {
    setLoadingIA(true);
    try {
      const res = await fetch(`${API_URL}/ia/analise-consumo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Erro ao carregar análise');
      }

      const ia = await res.json();

      if (!ia || !ia.analise_por_comodo) {
        throw new Error('Dados de análise inválidos');
      }

      setAnaliseIA(ia);
    } catch (error) {
      console.error('Erro ao carregar análise IA:', error);
      alert('Erro ao gerar análise. Verifique se você tem cômodos e aparelhos cadastrados.');
    } finally {
      setLoadingIA(false);
    }
  };

  const adicionarComodo = async () => {
    if (!novoComodo.nome) return;
    try {
      await fetch(`${API_URL}/comodos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoComodo)
      });
      setNovoComodo({ nome: '', descricao: '' });
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar cômodo:', error);
    }
  };

  const adicionarAparelho = async () => {
    if (!selectedComodo || !novoAparelho.nome) return;
    try {
      await fetch(`${API_URL}/aparelhos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...novoAparelho, comodo_id: selectedComodo.id })
      });
      setNovoAparelho({ nome: '', categoria: 'outros', potencia_watts: '', horas_uso_dia: '' });
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar aparelho:', error);
    }
  };

  const editarAparelho = async () => {
    if (!editingAparelho) return;
    try {
      await fetch(`${API_URL}/aparelhos/${editingAparelho.aparelho_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: editingAparelho.aparelho,
          categoria: editingAparelho.categoria,
          potencia_watts: editingAparelho.potencia_watts,
          horas_uso_dia: editingAparelho.horas_uso_dia
        })
      });
      setEditingAparelho(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao editar aparelho:', error);
    }
  };

  const deletarAparelho = async (id) => {
    if (!window.confirm('Deseja realmente deletar este aparelho?')) return;
    try {
      await fetch(`${API_URL}/aparelhos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao deletar aparelho:', error);
    }
  };

  const deletarComodo = async (id) => {
    if (!window.confirm('Deseja realmente deletar este cômodo? Todos os aparelhos serão removidos.')) return;
    try {
      await fetch(`${API_URL}/comodos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao deletar cômodo:', error);
    }
  };

  const calcularTotais = () => {
    if (!Array.isArray(consumoData) || consumoData.length === 0) {
      return { kwh: '0.00', reais: '0.00', watts: '0' };
    }

    const totalKwh = consumoData.reduce((acc, item) => acc + parseFloat(item.consumo_mensal_kwh || 0), 0);
    const totalReais = consumoData.reduce((acc, item) => acc + parseFloat(item.custo_mensal_reais || 0), 0);
    const totalWatts = consumoData.reduce((acc, item) => acc + parseFloat(item.potencia_watts || 0), 0);
    return {
      kwh: totalKwh.toFixed(2),
      reais: totalReais.toFixed(2),
      watts: totalWatts.toFixed(0)
    };
  };

  const getCategoriaInfo = (categoria) => {
    return CATEGORIAS[categoria] || CATEGORIAS['outros'];
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (!token || !usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Zap className="text-green-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Monitor de Energia</h1>
            <p className="text-gray-600 mt-2">Consumo consciente e sustentável</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${showLogin ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${!showLogin ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
            >
              Cadastro
            </button>
          </div>

          {showLogin ? (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Senha"
                value={loginData.senha}
                onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Entrar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={registerData.nome}
                onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Senha"
                value={registerData.senha}
                onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <button
                onClick={handleRegister}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totais = calcularTotais();

  return (
    <div className="min-h-screen bg-gray-50">
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

      <nav className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'comparativo', label: 'Comparativos', icon: TrendingUp },
              { id: 'ia', label: 'Análise IA', icon: Zap },
              { id: 'comodos', label: 'Cômodos', icon: Home }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'ia' && !analiseIA) {
                    carregarAnaliseIA();
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

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        )}

        {activeTab === 'comparativo' && (
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

            {/* Bloco de dados e cores*/}
            {(() => {
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
              );
            })()}
          </div>
        )}

        {activeTab === 'ia' && (
          <div className="space-y-6">
            {loadingIA ? (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Analisando seu consumo com IA...</p>
              </div>
            ) : !analiseIA ? (
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
            ) : (
              <>
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
                          s name="Consumo Esperado (IA)"
                          fill="#a0aec0" // Cinza (Base/Meta)
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                </div>

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
              </>
            )}
          </div>
        )}

        {activeTab === 'comodos' && (
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
                  onClick={adicionarComodo}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comodos.map(comodo => (
                <div key={comodo.id} className="bg-white p-6 rounded-lg shadow">
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
                      onClick={() => deletarComodo(comodo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedComodo(comodo)}
                    className="w-full px-4 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                  >
                    Gerenciar Aparelhos
                  </button>
                </div>
              ))}
            </div>

            {selectedComodo && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold">Aparelhos - {selectedComodo.nome}</h3>
                      <button
                        onClick={() => {
                          setSelectedComodo(null);
                          setEditingAparelho(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mb-6 space-y-3">
                      <input
                        type="text"
                        placeholder="Nome do aparelho"
                        value={novoAparelho.nome}
                        onChange={(e) => setNovoAparelho({ ...novoAparelho, nome: e.target.value })}
                        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
                      />
                      <select
                        value={novoAparelho.categoria}
                        onChange={(e) => setNovoAparelho({ ...novoAparelho, categoria: e.target.value })}
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
                          value={novoAparelho.potencia_watts}
                          onChange={(e) => setNovoAparelho({ ...novoAparelho, potencia_watts: e.target.value })}
                          className="px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Horas/dia"
                          value={novoAparelho.horas_uso_dia}
                          onChange={(e) => setNovoAparelho({ ...novoAparelho, horas_uso_dia: e.target.value })}
                          className="px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button
                        onClick={adicionarAparelho}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Adicionar Aparelho
                      </button>
                    </div>

                    <div className="space-y-3">
                      {consumoData
                        .filter(item => item.comodo === selectedComodo.nome)
                        .map((item, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded border">
                            {editingAparelho?.aparelho_id === item.aparelho_id ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editingAparelho.aparelho}
                                  onChange={(e) => setEditingAparelho({ ...editingAparelho, aparelho: e.target.value })}
                                  className="w-full px-3 py-2 border rounded"
                                />
                                <select
                                  value={editingAparelho.categoria}
                                  onChange={(e) => setEditingAparelho({ ...editingAparelho, categoria: e.target.value })}
                                  className="w-full px-3 py-2 border rounded"
                                >
                                  {Object.entries(CATEGORIAS).map(([key, val]) => (
                                    <option key={key} value={key}>{val.icon} {val.nome}</option>
                                  ))}
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="number"
                                    value={editingAparelho.potencia_watts}
                                    onChange={(e) => setEditingAparelho({ ...editingAparelho, potencia_watts: e.target.value })}
                                    className="px-3 py-2 border rounded"
                                    placeholder="Watts"
                                  />
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editingAparelho.horas_uso_dia}
                                    onChange={(e) => setEditingAparelho({ ...editingAparelho, horas_uso_dia: e.target.value })}
                                    className="px-3 py-2 border rounded"
                                    placeholder="Horas/dia"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={editarAparelho}
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
                              </div>
                            ) : (
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
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}