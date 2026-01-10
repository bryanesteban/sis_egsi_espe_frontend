'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useEffect, useState } from 'react';

interface BlockEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export default function BlockEditor({ initialContent, onChange, editable = true }: BlockEditorProps) {
  const [mounted, setMounted] = useState(false);

  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
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
