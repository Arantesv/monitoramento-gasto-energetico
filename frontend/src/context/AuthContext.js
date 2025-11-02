import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            verificarToken();
        } else {
            setLoading(false);
        }
    }, [token]);

    const verificarToken = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const login = async (loginData) => {
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
                return true;
            } else {
                throw new Error(data.error || 'Erro ao fazer login');
            }
        } catch (error) {
            alert('Erro ao conectar com servidor');
            throw error;
        }
    };

    const register = async (registerData) => {
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
                return true;
            } else {
                throw new Error(data.error || 'Erro ao cadastrar');
            }
        } catch (error) {
            alert('Erro ao conectar com servidor');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ token, usuario, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);