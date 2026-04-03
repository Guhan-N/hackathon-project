import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { API_URL } from '../config';
import ThemeToggle from '../components/ThemeToggle';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Server error while verifying email');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 size={48} className="mx-auto text-primary-500 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Verifying your email...</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Email Verified!</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{message}</p>
            </div>
            <Link 
              to="/login"
              className="inline-block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
              <XCircle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Verification Failed</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{message}</p>
            </div>
            <Link 
              to="/register"
              className="inline-block w-full py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl transition-all"
            >
              Back to Registration
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
