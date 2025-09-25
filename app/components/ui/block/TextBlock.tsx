'use client';

import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaBold, FaItalic, FaLink, FaUnlink, FaQuoteLeft } from 'react-icons/fa';
import { ContentBlockInput } from '@/types/post';
import { motion, AnimatePresence } from 'framer-motion';

interface TextBlockProps {
  block: ContentBlockInput;
  onChange: (updates: Partial<ContentBlockInput>) => void;
  onRemove: () => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const LINK_COLOR = '#3b82f6'; // Tailwind blue-500

const TextBlock = ({
  block,
  onChange,
  onRemove,
  isFocused,
  onFocus,
  onBlur,
}: TextBlockProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const linkDialogRef = useRef<HTMLDivElement | null>(null);

  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [currentLinkHref, setCurrentLinkHref] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // For hover preview tooltip
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Style anchors + add hover listeners
  const styleExistingAnchors = (root?: HTMLElement | null) => {
    const r = root ?? editorRef.current;
    if (!r) return;
    r.querySelectorAll('a').forEach((el) => {
      const a = el as HTMLAnchorElement;
      a.target = '_blank';
      a.style.color = LINK_COLOR;
      a.style.textDecoration = 'underline';
      a.style.cursor = 'pointer';

      // Hover listeners
      a.onmouseenter = () => {
        const rect = a.getBoundingClientRect();
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          setHoveredLink(a.href);
          setHoverPos({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top,
          });
        }
      };
      a.onmouseleave = () => setHoveredLink(null);
    });
  };

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = block.content || '';
    }
    styleExistingAnchors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close link dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (linkDialogRef.current && !linkDialogRef.current.contains(event.target as Node)) {
        setShowLinkDialog(false);
      }
    };

    if (showLinkDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLinkDialog]);

  // Handle selection change (for toolbar)
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || !editorRef.current) {
        setToolbarVisible(false);
        return;
      }

      const withinEditor = !!sel.anchorNode && editorRef.current.contains(sel.anchorNode);
      const hasSelection = !sel.isCollapsed;

      // Detect anchor
      let anchorEl: HTMLAnchorElement | null = null;
      if (withinEditor && sel.anchorNode) {
        let node: Node | null = sel.anchorNode;
        while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        if (node && (node as Element).closest) {
          anchorEl = (node as Element).closest('a') as HTMLAnchorElement | null;
        }
      }

      const insideLink = !!anchorEl;

      if ((hasSelection || insideLink) && withinEditor) {
        if (hasSelection) {
          try {
            setSavedRange(sel.getRangeAt(0));
          } catch {
            setSavedRange(null);
          }
        }

        // Compute rect for toolbar - position it above the selection
        let rect: DOMRect | null = null;
        try {
          if (hasSelection) rect = sel.getRangeAt(0).getBoundingClientRect();
          else if (anchorEl) rect = anchorEl.getBoundingClientRect();
        } catch {
          rect = null;
        }

        if (rect && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          // Position toolbar above the selection with some margin
          setToolbarPos({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top - 45, // Position higher to avoid covering text
          });
        }

        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsLink(insideLink);
        setCurrentLinkHref(anchorEl?.getAttribute('href') ?? null);
        setToolbarVisible(true);
        setShowLinkDialog(false); // Close link dialog when selection changes
      } else {
        setToolbarVisible(false);
        setIsLink(false);
        setCurrentLinkHref(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const restoreSelection = () => {
    if (savedRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);
    }
  };

  const findAnchorFromSelection = (): HTMLAnchorElement | null => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return null;
    let node: Node | null = sel.anchorNode;
    while (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    if (!node) return null;
    return (node as Element).closest ? ((node as Element).closest('a') as HTMLAnchorElement | null) : null;
  };

  // Bold/italic formatting
  const applyFormatting = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    styleExistingAnchors();
    onChange({ content: editorRef.current?.innerHTML || '' });
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
  };

  // Link create/edit
  const handleLinkAction = () => {
    const existing = findAnchorFromSelection();
    if (existing) {
      setLinkUrl(existing.getAttribute('href') || '');
    } else {
      setLinkUrl('');
    }
    setShowLinkDialog(true);
  };

  // Unlink
  const handleUnlink = () => {
    restoreSelection();
    const existing = findAnchorFromSelection();
    if (existing) {
      const textNode = document.createTextNode(existing.textContent || '');
      existing.replaceWith(textNode);
    } else {
      document.execCommand('unlink', false);
    }
    onChange({ content: editorRef.current?.innerHTML || '' });
    setIsLink(false);
    setCurrentLinkHref(null);
  };

  // Apply link from dialog
  const applyLink = () => {
    if (!linkUrl.trim()) {
      setShowLinkDialog(false);
      return;
    }

    const existing = findAnchorFromSelection();
    if (existing) {
      existing.href = linkUrl;
    } else {
      restoreSelection();
      document.execCommand('createLink', false, linkUrl);
    }

    styleExistingAnchors();
    onChange({ content: editorRef.current?.innerHTML || '' });
    setIsLink(true);
    setCurrentLinkHref(linkUrl);
    setShowLinkDialog(false);
  };

  const handleInput = () => {
    styleExistingAnchors();
    onChange({ content: editorRef.current?.innerHTML || '' });
  };

  // Get appropriate styling based on block type
  const getBlockStyles = () => {
    switch (block.type) {
      case 'heading':
        return {
          container: 'my-6',
          text: 'text-2xl font-extrabold text-gray-200 tracking-tight leading-snug'
        };
      case 'quote':
        return {
          container: 'border-l-4 border-l-purple-500 pl-8 pr-4 py-2 my-6 relative',
          text: 'text-lg italic text-gray-300 leading-relaxed'
        };
      default:
        return {
          container: '',
          text: 'text-lg text-gray-200 leading-relaxed'
        };
    }
  };

  const blockStyles = getBlockStyles();

  return (
    <div 
      ref={containerRef} 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex-grow p-2 rounded-lg border border-gray-700 bg-gray-800/50 transition-all duration-300 ${blockStyles.container} ${
        isFocused 
          ? 'ring-2 ring-purple-500/30 border-purple-500/50 bg-gray-800/40 shadow-md' 
          : 'hover:bg-gray-800/40 hover:border-purple-500/30'
      }`}>
        {/* Delete button positioned at top-right corner */}
        <AnimatePresence>
          {(isHovered || isFocused) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all shadow-md z-10"
              title="Delete text block"
            >
              <FaTimes size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Quote icon for quote blocks */}
        {block.type === 'quote' && (
          <div className="absolute top-2 left-2 text-purple-500">
            <FaQuoteLeft size={16} />
          </div>
        )}

        {/* Floating toolbar - positioned above the text */}
        <AnimatePresence>
          {toolbarVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute z-50 flex items-center space-x-1 bg-gray-900 text-white px-2 py-1.5 rounded-lg shadow-xl border border-gray-700"
              style={{
                top: `${Math.max(toolbarPos.y, -30)}px`,
                left: toolbarPos.x,
                transform: 'translateX(-50%)',
              }}
            >
              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormatting('bold'); }}
                className={`p-1.5 rounded transition-colors ${
                  isBold 
                    ? 'text-purple-400 bg-gray-800' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                title="Bold"
              >
                <FaBold size={14} />
              </button>

              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormatting('italic'); }}
                className={`p-1.5 rounded transition-colors ${
                  isItalic 
                    ? 'text-purple-400 bg-gray-800' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                title="Italic"
              >
                <FaItalic size={14} />
              </button>

              {isLink ? (
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleUnlink(); }}
                  className="p-1.5 rounded text-blue-400 hover:text-white hover:bg-gray-800 transition-colors"
                  title="Remove link"
                >
                  <FaUnlink size={14} />
                </button>
              ) : (
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleLinkAction(); }}
                  className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  title="Insert link"
                >
                  <FaLink size={14} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover link preview */}
        <AnimatePresence>
          {hoveredLink && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 bg-gray-900 text-white px-2 py-1 text-xs rounded shadow-lg border border-gray-700 max-w-xs break-words"
              style={{
                top: hoverPos.y + 30,
                left: hoverPos.x,
                transform: 'translate(-50%, -100%)',
                maxWidth: '200px',
                wordBreak: 'break-all',
              }}
            >
              {hoveredLink}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link Dialog */}
        <AnimatePresence>
          {showLinkDialog && (
            <motion.div
              ref={linkDialogRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-50 bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700"
              style={{
                top: toolbarPos.y - 100,
                left: toolbarPos.x,
                transform: 'translateX(-50%)',
                minWidth: '250px',
              }}
            >
              <div className="flex flex-col space-y-3">
                <h3 className="text-white font-medium text-xs">
                  {currentLinkHref ? 'Edit Link' : 'Insert Link'}
                </h3>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 bg-gray-800/50 text-gray-100 placeholder-gray-500 text-sm transition-all border border-gray-700"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && applyLink()}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowLinkDialog(false)}
                    className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyLink}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-xs"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editable div */}
        <div
          ref={editorRef}
          className={`w-full min-h-[40px] p-1 outline-none bg-transparent ${blockStyles.text} ${
            isFocused ? 'ring-0' : ''
          }`}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{ wordBreak: 'break-word' }}
        />
      </div>
    </div>
  );
};

export default TextBlock;