'use client';

import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaCopy, FaCheck, FaJava } from 'react-icons/fa';
import { SiJavascript, SiTypescript, SiPython, SiHtml5, SiCss3, SiMysql } from 'react-icons/si';
import { motion } from 'framer-motion';
import { ContentBlockInput } from '@/types/post';

interface CodeBlockProps {
  block: ContentBlockInput;
  onChange: (updates: Partial<ContentBlockInput>) => void;
  onRemove: () => void;
}

const CodeBlock = ({ block, onChange, onRemove }: CodeBlockProps) => {
  const [content, setContent] = useState(block.content || '');
  const [language, setLanguage] = useState(block.language || 'javascript');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onChange({ content: e.target.value });
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    onChange({ language: lang });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageOptions = [
    { id: 'javascript', name: 'JavaScript', icon: <SiJavascript size={16} className="text-yellow-400" /> },
    { id: 'typescript', name: 'TypeScript', icon: <SiTypescript size={16} className="text-blue-500" /> },
    { id: 'python', name: 'Python', icon: <SiPython size={16} className="text-blue-400" /> },
    { id: 'java', name: 'Java', icon: <FaJava size={16} className="text-red-500" /> },
    { id: 'html', name: 'HTML', icon: <SiHtml5 size={16} className="text-orange-500" /> },
    { id: 'css', name: 'CSS', icon: <SiCss3 size={16} className="text-blue-600" /> },
    { id: 'sql', name: 'SQL', icon: <SiMysql size={16} className="text-blue-700" /> },
  ];

  return (
    <div 
      className="relative my-8 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-grow bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
        {/* Close button positioned above language selector */}
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md z-10"
            title="Delete code block"
          >
            <FaTimes size={14} />
          </motion.button>
        )}
        
        {/* Language selector with hidden scrollbar */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {languageOptions.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-3 py-1.5 whitespace-nowrap rounded-lg text-xs transition-all duration-200 flex items-center gap-1 ${
                language === lang.id 
                  ? 'bg-gray-700 text-white shadow-sm border border-gray-600' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {lang.icon}
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 shadow-inner relative group/code">
          <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-mono">
            <span className="flex items-center gap-2">
              {languageOptions.find(lang => lang.id === language)?.icon}
              <span>{language}</span>
            </span>
            <button 
              onClick={handleCopy}
              className="px-2 py-1 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1 text-gray-300 hover:text-white border border-gray-700 text-xs"
            >
              {copied ? <FaCheck className="text-green-400" size={12} /> : <FaCopy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="relative">
            {/* Textarea with hidden scrollbar */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="// Write your code here..."
              className="w-full p-0 font-mono text-sm bg-transparent text-gray-100 outline-none resize-none overflow-auto scrollbar-hide"
              rows={5}
              spellCheck={false}
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;