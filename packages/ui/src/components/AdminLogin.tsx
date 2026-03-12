import React, { useState } from 'react';
import { Button } from './Button';

export const AdminLogin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                window.location.href = '/admin/dashboard';
            } else {
                setError('Contraseña incorrecta');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-4xl text-primary italic mb-2">Pásele Güerita</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Panel de Administración</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Contraseña de Acceso</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl border border-bg focus:ring-2 focus:ring-primary outline-none h-14"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                    <Button type="submit" className="w-full h-14 text-lg" disabled={isLoading}>
                        {isLoading ? 'Verificando...' : 'Entrar al Panel'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
