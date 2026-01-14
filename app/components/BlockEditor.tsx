'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useEffect, useState, useMemo } from 'react';

interface BlockEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export default function BlockEditor({ initialContent, onChange, editable = true }: BlockEditorProps) {
  const [mounted, setMounted] = useState(false);

  // Parsear el contenido inicial de forma segura
  const parsedInitialContent = useMemo(() => {
    if (!initialContent) return undefined;
    
    // Si ya es un objeto/array, usarlo directamente
    if (typeof initialContent === 'object') {
      return initialContent;
    }
    
    // Si es un string, intentar parsearlo
    if (typeof initialContent === 'string') {
      try {
        return JSON.parse(initialContent);
      } catch (e) {
        console.error('Error parsing BlockEditor initialContent:', e);
        return undefined;
      }
    }
    
    return undefined;
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: parsedInitialContent,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editor && onChange) {
      const handleChange = () => {
        const content = JSON.stringify(editor.document);
        onChange(content);
      };

      editor.onEditorContentChange(handleChange);
    }
  }, [editor, onChange]);

  if (!mounted) {
    return (
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Cargando editor...</span>
      </div>
    );
  }

  return (
    <div className="blocknote-wrapper">
      <BlockNoteView 
        editor={editor} 
        editable={editable}
        theme="light"
      />
    </div>
  );
}
