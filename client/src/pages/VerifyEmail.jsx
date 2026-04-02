import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/auth/verify/${token}`);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 size={48} className="mx-auto text-primary-500 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="text-sm text-gray-500">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-sm text-gray-500">{message}</p>
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
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <XCircle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-sm text-gray-500">{message}</p>
            </div>
            <Link 
              to="/register"
              className="inline-block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
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
