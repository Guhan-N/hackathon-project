import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, Link2, ArrowLeft, Lock } from 'lucide-react';
import { API_URL } from '../config';
import Editor from '../components/Editor';
import Presence from '../components/Presence';
import PasswordGate from '../components/PasswordGate';
import ThemeToggle from '../components/ThemeToggle';

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [provider, setProvider] = useState(null);
  const [username] = useState(localStorage.getItem('username') || 'Anonymous');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDocumentData = async (password = '') => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      if (password) headers['x-doc-password-verified'] = 'true';

      const response = await fetch(`${API_URL}/documents/${id}`, { headers });
      
      if (!response.ok) {
        if (response.status === 403) {
          const data = await response.json();
          if (data.needsPassword) {
            setDocument({ title: data.title, id: id }); // Store minimal metadata
            setIsLocked(true);
            return;
          }
        }
        if (response.status === 401) navigate('/login');
        throw new Error('Failed to load document');
      }
      
      const data = await response.json();
      setDocument(data);
      setIsLocked(false);
      if (password) setUnlockPassword(password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentData();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <header className="px-4 sm:px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary-500" />
            <h1 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white truncate max-w-[120px] sm:max-w-xs px-1 flex items-center gap-2">
              {document ? document.title : 'Loading...'}
              {isLocked && <Lock size={12} className="text-amber-500" />}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6">
          <Presence 
            provider={provider} 
            adminName={document?.owner?.name} 
            pastCollaborators={document?.collaborators || []}
          />
          <ThemeToggle />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
            className="hidden sm:flex items-center gap-1 text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-primary-100 cursor-pointer"
          >
            <Link2 size={12} />
            <span>Share</span>
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-8 flex-grow">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : isLocked ? (
          <PasswordGate 
            docId={id} 
            docTitle={document?.title} 
            onUnlock={(pass) => fetchDocumentData(pass)} 
          />
        ) : (
          <Editor key={id} docId={id} username={username} onProviderReady={setProvider} />
        )}
      </main>
    </div>
  );
};

export default DocumentEditor;
