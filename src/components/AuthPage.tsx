'use client';

import { useState } from 'react';
import { createOrGetUser } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function AuthPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Por favor ingresa un nombre');
      return;
    }

    setLoading(true);
    try {
      const userId = await createOrGetUser(username.trim());
      login(username.trim(), userId);
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gastetes 🐽
          </h1>
          <p className="text-sm text-white/40">
            Controla tus gastos fácilmente
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs text-white/40 uppercase tracking-wider">
              ¿Cuál es tu nombre?
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: Juan"
              className="w-full bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus:border-white/30 transition-colors outline-none text-white text-sm placeholder:text-white/20"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Footer message */}
        <p className="text-center text-white/30 text-xs mt-6">
          Tus datos se guardarán localmente y en la nube
        </p>
      </div>
    </div>
  );
}
