'use client';

import { useState } from 'react';
import { FaTimes, FaMinus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface DividerBlockProps {
  onRemove: () => void;
}

const DividerBlock = ({ onRemove }: DividerBlockProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative my-8 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button positioned at top-right corner */}
      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all shadow-md z-10"
            title="Delete divider"
          >
            <FaTimes size={14} />
          </motion.button>
        )}
      </AnimatePresence>


      <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
        <div className="flex-grow">
          <div className="relative">
            {/* Animated divider line */}
            <div className="absolute inset-0 flex items-center">
              <motion.div 
                className="w-full border-t border-gray-700 group-hover:border-purple-500 transition-colors duration-300"
                whileHover={{ scaleX: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            </div>
            
            {/* Interactive center icon */}
            <div className="relative flex justify-center">
              <motion.span 
                className="bg-gray-800 p-2 rounded-full border border-gray-700 text-gray-500 group-hover:text-purple-400 group-hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <FaMinus />
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DividerBlock;