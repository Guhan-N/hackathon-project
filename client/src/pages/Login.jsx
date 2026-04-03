import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Lock, Mail } from 'lucide-react';
import { API_URL } from '../config';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.name);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 mb-4">
            <FileText size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Sign in to access your documents</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 font-medium pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
