'use client';

import { useState } from 'react';

interface FloatingToolbarProps {
  isVisible: boolean;
  onBold: () => void;
  onItalic: () => void;
  onLink: () => void;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
  onRemove: () => void;
}

export default function FloatingToolbar({
  isVisible,
  onBold,
  onItalic,
  onLink,
  onAddAbove,
  onAddBelow,
  onRemove,
}: FloatingToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  if (!isVisible) return null;

  return (
    <div
      className="absolute flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)'
      }}
    >
      <button
        onClick={onBold}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        aria-label="Bold"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h16M7 12h10M5 18h14" />
        </svg>
      </button>
      <button
        onClick={onItalic}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        aria-label="Italic"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 5h10M5 19h14" />
        </svg>
      </button>
      <button
        onClick={onLink}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        aria-label="Link"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>
      <div className="h-6 border-r border-gray-200 dark:border-gray-700 mx-1"></div>
      {onAddAbove && (
        <button
          onClick={onAddAbove}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label="Add above"
        >
          ↑
        </button>
      )}
      {onAddBelow && (
        <button
          onClick={onAddBelow}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label="Add below"
        >
          ↓
        </button>
      )}
      <button
        onClick={onRemove}
        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
        aria-label="Remove"
      >
        ✕
      </button>
    </div>
  );
}