import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../constants';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { token } = useAuth();

    // Estados de dados
    const [comodos, setComodos] = useState([]);
    const [consumoData, setConsumoData] = useState([]);
    const [relatorioMensal, setRelatorioMensal] = useState([]);
    const [categoriasData, setCategoriasData] = useState([]);
    const [mediaGeral, setMediaGeral] = useState(null);
    const [mediaBrasil, setMediaBrasil] = useState(null);

    // Estado de Análise IA
    const [analiseIA, setAnaliseIA] = useState(null);
    const [loadingIA, setLoadingIA] = useState(false);

    // Carregar todos os dados da aplicação
    const carregarDados = useCallback(async () => {
        if (!token) return;
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
    }, [token]);

    // Carregar dados iniciais
    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Derivar totais do estado de consumoData
    const totais = useMemo(() => {
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
    }, [consumoData]);

    // --- Funções CRUD ---

    const adicionarComodo = async (novoComodo) => {
        if (!novoComodo.nome) return;
        try {
            await fetch(`${API_URL}/comodos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(novoComodo)
            });
            carregarDados(); // Recarrega tudo
        } catch (error) {
            console.error('Erro ao adicionar cômodo:', error);
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

    const adicionarAparelho = async (novoAparelho, comodo_id) => {
        if (!comodo_id || !novoAparelho.nome) return;
        try {
            await fetch(`${API_URL}/aparelhos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...novoAparelho, comodo_id: comodo_id })
            });
            carregarDados();
        } catch (error) {
            console.error('Erro ao adicionar aparelho:', error);
        }
    };

    const editarAparelho = async (editingAparelho) => {
        if (!editingAparelho) return;
        try {
            await fetch(`${API_URL}/aparelhos/${editingAparelho.aparelho_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    nome: editingAparelho.aparelho,
                    categoria: editingAparelho.categoria,
                    potencia_watts: editingAparelho.potencia_watts,
                    horas_uso_dia: editingAparelho.horas_uso_dia
                })
            });
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

    // --- Função IA ---
    const carregarAnaliseIA = async () => {
        setLoadingIA(true);
        setAnaliseIA(null);
        try {
            const res = await fetch(`${API_URL}/ia/analise-consumo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Erro ao carregar análise');
            const ia = await res.json();
            if (!ia || !ia.analise_por_comodo) throw new Error('Dados de análise inválidos');
            setAnaliseIA(ia);
        } catch (error) {
            console.error('Erro ao carregar análise IA:', error);
            alert('Erro ao gerar análise. Verifique se você tem cômodos e aparelhos cadastrados.');
        } finally {
            setLoadingIA(false);
        }
    };


    const value = {
        comodos,
        consumoData,
        relatorioMensal,
        categoriasData,
        mediaGeral,
        mediaBrasil,
        totais,
        analiseIA,
        loadingIA,
        carregarDados,
        carregarAnaliseIA,
        adicionarComodo,
        deletarComodo,
        adicionarAparelho,
        editarAparelho,
        deletarAparelho,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);