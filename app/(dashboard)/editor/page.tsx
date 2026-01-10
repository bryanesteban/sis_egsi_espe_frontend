'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FileText, Save, Eye, Edit3, Download, Upload, Clock, CheckCircle } from 'lucide-react';
import RoleGuard from '@/app/components/RoleGuard';
import { useAppDispatch } from '@/app/store/hooks';
import { showToast } from '@/app/store/slices/toastSlice';

// Importar el editor dinámicamente para evitar errores de SSR
const BlockEditor = dynamic(() => import('@/app/components/BlockEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-500 dark:text-gray-400">Cargando editor...</span>
    </div>
  ),
});

interface Document {
  id: string;
  title: string;
  content: string;
  lastSaved: Date | null;
  status: 'draft' | 'saved';
}

export default function EditorPage() {
  const dispatch = useAppDispatch();
  const [document, setDocument] = useState<Document>({
    id: '1',
    title: 'Nuevo Documento',
    content: '',
    lastSaved: null,
    status: 'draft',
  });
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const handleContentChange = useCallback((content: string) => {
    setDocument(prev => ({
      ...prev,
      content,
      status: 'draft',
    }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular guardado en backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDocument(prev => ({
        ...prev,
        lastSaved: new Date(),
        status: 'saved',
      }));
      
      dispatch(showToast({ message: 'Documento guardado correctamente', type: 'success' }));
    } catch (error) {
      dispatch(showToast({ message: 'Error al guardar el documento', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ title: document.title, content: document.content }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch(showToast({ message: 'Documento exportado', type: 'success' }));
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setDocument(prev => ({
          ...prev,
          title: data.title || 'Documento Importado',
          content: data.content || '',
          status: 'draft',
        }));
        dispatch(showToast({ message: 'Documento importado correctamente', type: 'success' }));
      } catch (error) {
        dispatch(showToast({ message: 'Error al importar el documento', type: 'error' }));
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Sin guardar';
    return new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'USER', 'EDITOR']}>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                {editingTitle ? (
                  <input
                    type="text"
                    value={document.title}
                    onChange={(e) => setDocument(prev => ({ ...prev, title: e.target.value }))}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                    className="text-xl font-bold bg-transparent border-b-2 border-purple-500 outline-none text-gray-900 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setEditingTitle(true)}
                    className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {document.title}
                  </h1>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Último guardado: {formatDate(document.lastSaved)}</span>
                  {document.status === 'saved' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Preview/Edit */}
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPreview
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreview ? 'Editar' : 'Vista previa'}
              </button>

              {/* Import */}
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              {/* Export */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Edit3 className="w-4 h-4" />
              <span>Escribe &quot;/&quot; para ver los comandos disponibles</span>
            </div>
          </div>
          <div className="p-4">
            <BlockEditor
              initialContent={document.content || undefined}
              onChange={handleContentChange}
              editable={!isPreview}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">💡 Consejos del Editor</h3>
          <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
            <li>• Escribe <kbd className="px-1 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-xs">/</kbd> para ver todos los tipos de bloques disponibles</li>
            <li>• Arrastra los bloques para reordenarlos</li>
            <li>• Selecciona texto para ver las opciones de formato</li>
            <li>• Usa <kbd className="px-1 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-xs">Ctrl+S</kbd> para guardar rápidamente</li>
          </ul>
        </div>
      </div>
    </RoleGuard>
  );
}
