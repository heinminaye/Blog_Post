'use client';

import { useState, useRef, useEffect } from 'react';
import { IContentBlock } from '@/types/post';
import FloatingToolbar from './FloatingToolbar';

interface RichTextEditorProps {
  block: IContentBlock;
  onChange: (updates: Partial<IContentBlock>) => void;
  onRemove: () => void;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
}

export default function RichTextEditor({
  block,
  onChange,
  onRemove,
  onAddAbove,
  onAddBelow,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBelow?.();
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onRemove();
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading': return 'Heading';
      case 'quote': return 'Quote';
      default: return 'Type \'/\' for commands...';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative group ${isFocused ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
    >
      <textarea
        ref={textareaRef}
        value={block.content || ''}
        onChange={(e) => onChange({ content: e.target.value })}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className={`w-full p-2 border-none outline-none resize-none overflow-hidden placeholder:text-gray-300 dark:bg-transparent ${
          block.type === 'heading' ? 'text-2xl font-bold' :
          block.type === 'quote' ? 'italic pl-4 border-l-4 border-gray-300' :
          'text-lg'
        }`}
      />

      <FloatingToolbar
        isVisible={isFocused}
        onBold={() => onChange({ content: `**${block.content || ''}**` })}
        onItalic={() => onChange({ content: `_${block.content || ''}_` })}
        onLink={() => {
          const url = prompt('Enter URL:');
          if (url) onChange({ content: `[${block.content || 'link'}](${url})` });
        }}
        onAddAbove={onAddAbove}
        onAddBelow={onAddBelow}
        onRemove={onRemove}
      />
    </div>
  );
}