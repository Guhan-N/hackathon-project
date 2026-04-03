import React, { useState } from 'react';
import { FileText, Lock, Globe, X } from 'lucide-react';

const CreateDocModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Document title is required');
      return;
    }
    if (isPrivate && !password.trim()) {
      setError('Password is required for private documents');
      return;
    }
    
    onCreate({ title: title.trim(), isPrivate, password });
    onClose();
    // Reset form
    setTitle('');
    setIsPrivate(false);
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-transparent dark:border-slate-800">
        <div className="p-6 bg-primary-600 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold">
            <FileText size={20} />
            <h2>Create New Document</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
              <X size={14} />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Report"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Privacy Level</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  !isPrivate 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                  : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 text-gray-400 dark:text-slate-600'
                }`}
              >
                <Globe size={20} />
                <span className="text-xs font-bold uppercase tracking-tighter">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  isPrivate 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                  : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 text-gray-400 dark:text-slate-600'
                }`}
              >
                <Lock size={20} />
                <span className="text-xs font-bold uppercase tracking-tighter">Private</span>
              </button>
            </div>
          </div>

          {isPrivate && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Set Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 ml-1 font-medium italic">Collaborators will need this password to enter.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98]"
          >
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDocModal;
