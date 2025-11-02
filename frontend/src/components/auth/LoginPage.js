import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [showLogin, setShowLogin] = useState(true);
    const [loginData, setLoginData] = useState({ email: '', senha: '' });
    const [registerData, setRegisterData] = useState({ nome: '', email: '', senha: '' });

    const handleLogin = async () => {
        try {
            await login(loginData);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleRegister = async () => {
        try {
            await register(registerData);
        } catch (error) {
            console.error(error.message);
        }
    };

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