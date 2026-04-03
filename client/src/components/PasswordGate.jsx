import React, { useState } from 'react';
import { Lock, ShieldAlert, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const PasswordGate = ({ docId, docTitle, onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/documents/${docId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Incorrect password');
      }

      onUnlock(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl p-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500 shadow-inner">
            <Lock size={36} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Protected Workspace</h2>
            <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">
              "<span className="text-gray-600 dark:text-slate-300 font-bold">{docTitle}</span>" is a private document.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
            <ShieldAlert size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Workspace Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-center text-lg font-bold tracking-widest placeholder:tracking-normal"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Unlock Workspace
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <Link 
              to="/dashboard"
              className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors py-2"
            >
              <ArrowLeft size={14} />
              Return to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
