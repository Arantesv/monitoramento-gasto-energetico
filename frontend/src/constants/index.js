export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const CATEGORIAS = {
    'climatizacao': { nome: 'Climatização', icon: '❄️', cor: '#3b82f6' },
    'iluminacao': { nome: 'Iluminação', icon: '💡', cor: '#fbbf24' },
    'eletrodomesticos': { nome: 'Eletrodomésticos', icon: '🔌', cor: '#10b981' },
    'entretenimento': { nome: 'Entretenimento', icon: '📺', cor: '#8b5cf6' },
    'higiene': { nome: 'Higiene', icon: '🚿', cor: '#ec4899' },
    'outros': { nome: 'Outros', icon: '⚡', cor: '#6b7280' }
};

export const getCategoriaInfo = (categoria) => {
    return CATEGORIAS[categoria] || CATEGORIAS['outros'];
};

export const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];