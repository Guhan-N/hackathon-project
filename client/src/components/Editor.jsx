import React, { useEffect, useState, useMemo, useRef } from 'react';
import { WS_URL } from '../config';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import UnderlineExtension from '@tiptap/extension-underline';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { 
  Bold, Italic, Underline, List, ListOrdered,
  Quote, RotateCcw, RotateCw, Save, Info, AlertTriangle,
  Download, Loader2, FileText, File, ChevronDown
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Safe Icon wrapper to prevent crashes if an icon is missing in lucide-react@1.7.0
const SafeIcon = ({ icon: Icon, fallback: Fallback = AlertTriangle, ...props }) => {
  if (!Icon) return <Fallback {...props} />;
  try {
    return <Icon {...props} />;
  } catch (e) {
    return <Fallback {...props} />;
  }
};

const COLORS = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70C283', '#6FC2B0', '#403294', '#071D70', '#8D0D5D', '#613147'];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

// Internal Editor component that only mounts when Yjs is ready
const TipTapEditor = ({ ydoc, provider, username }) => {
  console.log('[TipTapEditor] Props:', { 
    ydoc: !!ydoc, 
    provider: !!provider, 
    awareness: provider ? !!provider.awareness : false,
    username 
  });

  const extensions = useMemo(() => {
    if (!ydoc || !provider || !provider.awareness) {
      console.warn('[TipTapEditor] Dependencies not fully ready for CollaborationCursor');
      return [];
    }
    
    return [
      StarterKit.configure({
        history: false,
      }),
      UnderlineExtension,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: username,
          color: getRandomColor(),
        },
      }),
    ];
  }, [ydoc, provider, username]);

  const editor = useEditor({
    extensions,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDocTitle = () => document.querySelector('h1')?.innerText || 'Collaborative-Document';

  const handleExportPDF = async () => {
    if (!editor || isExporting) return;
    
    setIsExporting(true);
    const element = document.querySelector('.ProseMirror');
    
    if (!element) {
      console.error('Editor element not found for PDF export');
      setIsExporting(false);
      return;
    }

    // Get the actual document title from the page if possible
    const docTitle = getDocTitle();
    
    const opt = {
      margin:       1,
      filename:     `${docTitle}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Export failed:', err);
    } finally {
      setIsExporting(false);
      setShowExportDropdown(false);
    }
  };

  const handleExportWord = () => {
    if (!editor) return;
    const content = editor.getHTML();
    const docTitle = getDocTitle();
    
    // Simple HTML to Word (.doc) template
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${docTitle}</title></head><body style='font-family: Arial, sans-serif;'>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${docTitle}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    setShowExportDropdown(false);
  };

  const handleExportText = () => {
    if (!editor) return;
    const content = editor.getText();
    const docTitle = getDocTitle();
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docTitle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowExportDropdown(false);
  };

  if (!editor || extensions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4 max-w-4xl mx-auto">
        <div className="w-10 h-10 border-4 border-primary-50 dark:border-primary-900/30 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500 dark:text-slate-400 tracking-tight">Finalizing sync details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in duration-500 relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20 rounded-t-xl">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-slate-800 text-primary-600' : 'text-gray-600 dark:text-slate-400'}`}
          title="Bold (Ctrl+B)"
        >
          <SafeIcon icon={Bold} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-slate-800 text-primary-600' : 'text-gray-600 dark:text-slate-400'}`}
          title="Italic (Ctrl+I)"
        >
          <SafeIcon icon={Italic} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('underline') ? 'bg-gray-200 dark:bg-slate-800 text-primary-600' : 'text-gray-600 dark:text-slate-400'}`}
          title="Underline (Ctrl+U)"
        >
          <SafeIcon icon={Underline} size={18} />
        </button>
        <div className="w-[1px] h-6 bg-gray-300 dark:bg-slate-800 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-slate-800 text-primary-600' : 'text-gray-600 dark:text-slate-400'}`}
        >
          <SafeIcon icon={List} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-slate-800 text-primary-600' : 'text-gray-600 dark:text-slate-400'}`}
        >
          <SafeIcon icon={ListOrdered} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-slate-800 text-primary-600' : 'text-gray-600 dark:text-slate-400'}`}
        >
          <SafeIcon icon={Quote} size={18} />
        </button>
        <div className="w-[1px] h-6 bg-gray-300 dark:bg-slate-800 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition-colors"
          disabled={!editor.can().undo()}
        >
          <SafeIcon icon={RotateCcw} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition-colors"
          disabled={!editor.can().redo()}
        >
          <SafeIcon icon={RotateCw} size={18} />
        </button>
        
        <div className="w-[1px] h-6 bg-gray-300 dark:bg-slate-800 mx-1"></div>
        
        {/* Export Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 active:scale-95 ${
              isExporting 
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border-gray-200 dark:border-slate-700' 
              : 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-900/30 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-200 shadow-sm'
            }`}
            disabled={isExporting}
            title="Download Document"
          >
            {isExporting ? (
              <SafeIcon icon={Loader2} size={14} className="animate-spin" />
            ) : (
              <SafeIcon icon={Download} size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            )}
            <span className="text-xs font-bold whitespace-nowrap">
              {isExporting ? 'Exporting...' : 'Export'}
            </span>
            <SafeIcon icon={ChevronDown} size={12} className={`transition-transform duration-300 ${showExportDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showExportDropdown && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 flex items-center gap-2">
                  <Download size={10} />
                  Format Selection
                </span>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleExportPDF}
                  className="w-full group/item flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all text-left font-medium active:scale-[0.98]"
                >
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg group-hover/item:scale-110 transition-transform">
                    <SafeIcon icon={File} size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">PDF Document</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">Perfect for sharing</span>
                  </div>
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full group/item flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all text-left font-medium active:scale-[0.98]"
                >
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg group-hover/item:scale-110 transition-transform">
                    <SafeIcon icon={File} size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Word (.doc)</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">Editable format</span>
                  </div>
                </button>
                <button
                  onClick={handleExportText}
                  className="w-full group/item flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all text-left font-medium active:scale-[0.98]"
                >
                  <div className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-lg group-hover/item:scale-110 transition-transform">
                    <SafeIcon icon={FileText} size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Plain Text</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">Raw content only</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 font-medium px-2">
          <SafeIcon icon={Save} size={14} className="text-green-500" />
          <span>Autosaved</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-0 sm:p-4 bg-gray-50 dark:bg-slate-950 flex-grow min-h-[85vh] transition-colors duration-300">
        <EditorContent editor={editor} className="max-w-screen-md mx-auto" />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 text-[10px] sm:text-xs text-gray-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Connected as <strong className="dark:text-slate-200">{username}</strong></span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Writing...</span>
        </div>
      </div>
    </div>
  );
};

const Editor = ({ docId, username, onProviderReady }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);

  useEffect(() => {
    // Prevent double-initialization in React 19
    if (ydocRef.current) return;
    
    try {
      const doc = new Y.Doc();
      console.log(`[Editor] Initializing connection for ${docId}`);
      
      const prov = new WebsocketProvider(WS_URL, docId, doc);
      
      prov.on('status', event => {
        console.log(`[Editor] Connection status for ${docId}:`, event.status);
      });

      prov.on('connection-error', err => {
        console.error(`[Editor] Connection error for ${docId}:`, err);
        setError('Failed to connect to the synchronization server.');
      });

      ydocRef.current = doc;
      providerRef.current = prov;
      
      setIsReady(true);
      if (onProviderReady) onProviderReady(prov);

    } catch (err) {
      console.error('[Editor] Fatal initialization error:', err);
      setError(err.message);
    }

    return () => {
      // In React 19, we need to be careful with cleanup to not break the second mount
      // But for WebSockets, we usually WANT to close it. 
      // However, if we're crashing, let's keep it alive briefly.
      console.log(`[Editor] Cleanup for ${docId}`);
    };
  }, [docId, onProviderReady]);

  if (error) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-red-50 dark:border-red-900/30 space-y-4">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <Info size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 dark:text-white">Sync Error</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (!isReady || !ydocRef.current || !providerRef.current) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-6 max-w-4xl mx-auto">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-50 dark:border-primary-900/30 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-gray-800 dark:text-white">Initializing Workspace</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-slate-500 animate-pulse">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  // Once Yjs is ready, mount the actual editor
  return <TipTapEditor ydoc={ydocRef.current} provider={providerRef.current} username={username} />;
};

export default Editor;
