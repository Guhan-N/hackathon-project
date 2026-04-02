import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, LogOut, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();

  const getUserIdFromToken = (token) => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id;
    } catch (e) {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken(localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDocuments(token);
  }, [navigate]);

  const fetchDocuments = async (token) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
        }
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const createDocument = async () => {
    try {
      const inputTitle = window.prompt("Enter document name:", `Untitled Document ${documents.length + 1}`);
      if (inputTitle === null) return; // User cancelled
      
      const title = inputTitle.trim() || `Untitled Document ${documents.length + 1}`;
      const token = localStorage.getItem('token');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/documents`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title }),
      });
      
      const newDoc = await response.json();
      setDocuments([...documents, newDoc]);
      navigate(`/document/${newDoc._id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          alert('Only the admin (creator) can delete this document');
        } else if (response.status === 401) {
          handleLogout();
        } else {
          throw new Error(errorData.error || 'Failed to delete document');
        }
        return;
      }
      
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <header className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
            <FileText size={16} />
          </div>
          <span className="text-lg">CollabDocs</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 hidden sm:block">Hello, {username}</span>
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-grow p-6 sm:p-12 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Documents</h2>
            <p className="text-sm text-gray-500">Pick a file or create a new one to begin</p>
          </div>
          <button
            onClick={createDocument}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95"
          >
            <Plus size={16} />
            New Doc
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 border-2 border-dashed border-gray-200 rounded-3xl">
              <FileText size={48} className="mx-auto text-gray-200" />
              <div className="space-y-1">
                <p className="text-gray-400 font-medium">No documents yet</p>
                <button onClick={createDocument} className="text-primary-600 hover:text-primary-700 font-bold text-sm">Create your first document</button>
              </div>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/document/${doc._id}`)}
                className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary-100 cursor-pointer transition-all group scale-100 hover:scale-[1.02] relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 rounded-xl transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-300">
                      ID: {doc._id.slice(-4)}
                    </div>
                    {doc.owner === currentUserId && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc._id);
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors truncate">{doc.title}</h3>
                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-1">
                  Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
