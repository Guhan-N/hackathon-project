import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, Link2, ArrowLeft } from 'lucide-react';
import Editor from '../components/Editor';
import Presence from '../components/Presence';

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [provider, setProvider] = useState(null);
  const [username] = useState(localStorage.getItem('username') || 'Anonymous');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDocumentData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/documents/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
          }
          throw new Error('Failed to load document');
        }
        
        const data = await response.json();
        setDocument(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDocumentData();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="w-[1px] h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary-500" />
            <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate max-w-[120px] sm:max-w-xs px-1">
              {document ? document.title : 'Loading...'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6">
          <Presence 
            provider={provider} 
            adminName={document?.owner?.name} 
            pastCollaborators={document?.collaborators || []}
          />
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
        <Editor key={id} docId={id} username={username} onProviderReady={setProvider} />
      </main>
    </div>
  );
};

export default DocumentEditor;
