'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FaExchangeAlt, FaSpinner } from 'react-icons/fa';
import { FiUploadCloud } from "react-icons/fi";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CoverImageUploadProps {
  coverImage: string;
  onCoverImageUpload: (file: File) => Promise<void>;
  onRemoveCoverImage: () => void;
}

const CoverImageUpload = ({ coverImage, onCoverImageUpload, onRemoveCoverImage }: CoverImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const maxSizeMB = 5;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.[0] && e.dataTransfer.files[0].type.startsWith('image/')) {
      if (e.dataTransfer.files[0].size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size must be under ${maxSizeMB}MB`);
        return;
      }
      await uploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      if (e.target.files[0].size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size must be under ${maxSizeMB}MB`);
        return;
      }
      await uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      await onCoverImageUpload(file);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Uploading state
  if (isUploading) {
    return (
      <div className="relative my-8">
        <div
          className="flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-purple-500/50 bg-gray-800/40"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.8,
            }}
          >
            <div className="w-12 h-12 mb-4 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <FaSpinner className="text-white text-2xl animate-spin" />
            </div>
            <p className="text-gray-400">Uploading cover image...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Image display state
  if (coverImage) {
    return (
      <div 
        className="relative my-8 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
          {/* Change button appears on hover */}
          {isHovered && (

             <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                         onClick={() => {
                onRemoveCoverImage();
                // Reset the file input
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
                          className="absolute top-4 left-3 flex items-center gap-2 px-3 py-1.5 text-sm bg-white/90 text-gray-900 rounded-full hover:bg-white transition-colors shadow-md z-10"
                          title="Change image"
            >
              
                          <FaExchangeAlt size={12} />
                          <span className="hidden sm:inline">Change</span>
                        </motion.button>
          )}

          {/* Image container */}
          <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={coverImage}
              alt="Cover image"
              width={1200}
              height={600}
              className="w-full h-56 md:h-64 object-cover"
              priority
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    );
  }

  // Empty state - ready for upload
  return (
    <div className="relative my-8">
      <label
        className={`flex flex-col items-center justify-center w-full h-48 rounded-2xl cursor-pointer transition-all duration-300 p-6
          ${
            isDragging
              ? "border-purple-500 bg-purple-500/5"
              : "border-gray-700 bg-gray-800/40 hover:border-purple-500/50"
          }
          border-2 [border-style:dashed] [border-spacing:20px]`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 mb-4 bg-gray-800 rounded-lg flex items-center justify-center shadow-md border border-gray-700">
            <FiUploadCloud className="text-gray-200 text-2xl" />
          </div>
          <p className="text-gray-200 font-semibold">Upload your cover image</p>
          <p className="text-gray-400 text-sm">Click to browse or drag & drop ({maxSizeMB}MB max)</p>
        </div>
      </label>
    </div>
  );
};

export default CoverImageUpload;