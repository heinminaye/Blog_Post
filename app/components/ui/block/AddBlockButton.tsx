"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaParagraph,
  FaHeading,
  FaImage,
  FaVideo,
  FaQuoteRight,
  FaMinus,
  FaPlus,
  FaCode,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ContentBlockType } from "@/types/post";

interface AddBlockButtonProps {
  onAddBlock: (type: ContentBlockType) => void;
}

interface BlockType {
  type: ContentBlockType;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const AddBlockButton = ({ onAddBlock }: AddBlockButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const blockTypes: BlockType[] = [
    {
      type: "paragraph",
      label: "Text Block",
      icon: <FaParagraph size={16} />,
      color: "bg-slate-700",
      hoverColor: "bg-slate-600",
    },
    {
      type: "heading",
      label: "Heading",
      icon: <FaHeading size={16} />,
      color: "bg-slate-700",
      hoverColor: "bg-slate-600",
    },
    {
      type: "image",
      label: "Image",
      icon: <FaImage size={16} />,
      color: "bg-slate-700",
      hoverColor: "bg-slate-600",
    },
    {
      type: "embed",
      label: "Video Embed",
      icon: <FaVideo size={16} />,
      color: "bg-slate-700",
      hoverColor: "bg-slate-600",
    },
    {
      type: "code",
      label: "Code Block",
      icon: <FaCode size={16} />,
      color: "bg-slate-700",
      hoverColor: "bg-slate-600",
    },
    {
      type: "quote",
      label: "Quote",
      icon: <FaQuoteRight size={16} />,
      color: "bg-slate-700",
      hoverColor: "bg-slate-600",
    },
    {
      type: "divider",
      label: "Divider Line",
      icon: <FaMinus size={16} />,
      color: "bg-slate-700",
      hoverColor: "bg-slate-600",
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredBlock(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type: ContentBlockType) => {
    onAddBlock(type);
    setIsOpen(false);
    setHoveredBlock(null);
  };

  return (
    <div className="relative my-2 inline-block" ref={menuRef}>
      {/* Plus button with improved animation */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
          isOpen
            ? "bg-slate-700 text-white"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
        }`}
        aria-label={isOpen ? "Close block menu" : "Add block"}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          <FaPlus size={16} />
        </motion.div>
      </motion.button>

      {/* Horizontal block type selector with top tooltips */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                staggerChildren: 0.03,
                delayChildren: 0.1,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              x: -10,
              transition: { duration: 0.15 },
            }}
            className="absolute left-full -top-1 ml-3 bg-slate-800 rounded-lg shadow-lg p-2 z-30"
          >
            <div className="flex gap-2">
              {blockTypes.map((item, index) => (
                <motion.div
                  key={item.type}
                  className="relative"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: index * 0.03,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: 5,
                    transition: { duration: 0.1 },
                  }}
                >
                  <motion.button
                    onMouseEnter={() => setHoveredBlock(item.type)}
                    onMouseLeave={() => setHoveredBlock(null)}
                    onClick={() => handleSelect(item.type)}
                    whileHover={{
                      scale: 1.1,
                      y: -2,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 flex items-center justify-center ${
                      item.color
                    } rounded-lg text-slate-200 transition-colors duration-200 ${
                      hoveredBlock === item.type ? item.hoverColor : ""
                    }`}
                    aria-label={item.label}
                  >
                    {item.icon}
                  </motion.button>

                  {/* Top position tooltip */}
                  <AnimatePresence>
                    {hoveredBlock === item.type && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: 5,
                        }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-slate-200 text-xs font-medium rounded whitespace-nowrap shadow-lg z-40"
                      >
                        {item.label}
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-700 rotate-45"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddBlockButton;
