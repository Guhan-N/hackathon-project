import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import UnderlineExtension from '@tiptap/extension-underline';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { 
  Bold, Italic, Underline, List, ListOrdered,
  Quote, RotateCcw, RotateCw, Save, Info, AlertTriangle
} from 'lucide-react';

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

  if (!editor || extensions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-4 max-w-4xl mx-auto">
        <div className="w-10 h-10 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500 tracking-tight">Finalizing sync details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 overflow-x-auto no-scrollbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
          title="Bold (Ctrl+B)"
        >
          <SafeIcon icon={Bold} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
          title="Italic (Ctrl+I)"
        >
          <SafeIcon icon={Italic} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('underline') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
          title="Underline (Ctrl+U)"
        >
          <SafeIcon icon={Underline} size={18} />
        </button>
        <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
        >
          <SafeIcon icon={List} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
        >
          <SafeIcon icon={ListOrdered} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
        >
          <SafeIcon icon={Quote} size={18} />
        </button>
        <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors"
          disabled={!editor.can().undo()}
        >
          <SafeIcon icon={RotateCcw} size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors"
          disabled={!editor.can().redo()}
        >
          <SafeIcon icon={RotateCw} size={18} />
        </button>
        
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400 font-medium px-2">
          <SafeIcon icon={Save} size={14} className="text-green-500" />
          <span>Autosaved</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-0 sm:p-4 bg-gray-50 flex-grow min-h-[85vh]">
        <EditorContent editor={editor} className="max-w-screen-md mx-auto" />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-[10px] sm:text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Connected as <strong>{username}</strong></span>
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
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
      console.log(`[Editor] Initializing connection for ${docId}`);
      
      const prov = new WebsocketProvider(wsUrl, docId, doc);
      
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
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-3xl shadow-sm border border-red-50 space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <Info size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900">Sync Error</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (!isReady || !ydocRef.current || !providerRef.current) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-6 max-w-4xl mx-auto">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-gray-800">Initializing Workspace</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 animate-pulse">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  // Once Yjs is ready, mount the actual editor
  return <TipTapEditor ydoc={ydocRef.current} provider={providerRef.current} username={username} />;
};

export default Editor;
