"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FaTimes, FaSpinner, FaExchangeAlt } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { motion } from "framer-motion";
import { ContentBlockInput } from "@/types/post";
import { toast } from "sonner";

interface ImageBlockProps {
  block: ContentBlockInput;
  onChange: (updates: Partial<ContentBlockInput>) => void;
  onRemove: () => void;
  onUpload: (file: File) => Promise<void>;
  onDeleteImage: (publicId: string) => Promise<void>;
}

const ImageBlock = ({
  block,
  onChange,
  onRemove,
  onUpload,
  onDeleteImage,
}: ImageBlockProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const maxSizeMB = 5;

  // Safe check for block existence and url property
  const hasImage = block && block.url;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await onUpload(file);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ caption: e.target.value });
  };

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ altText: e.target.value });
  };

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

    if (
      e.dataTransfer.files?.[0] &&
      e.dataTransfer.files[0].type.startsWith("image/")
    ) {
      if (e.dataTransfer.files[0].size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size must be under ${maxSizeMB}MB`);
        return;
      }
      await uploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = async () => {
    if (block.publicId) {
      setIsDeleting(true);
      try {
        await onDeleteImage(block.publicId);
        // Clear the image data but keep the block
        onChange({ 
          url: "", 
          publicId: "", 
          width: undefined, 
          height: undefined,
          altText: "",
          caption: ""
        });
        toast.success("Image removed successfully");
      } catch (error) {
        toast.error("Failed to remove image");
        console.error("Removal error:", error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      // If no publicId, just clear the image data
      onChange({ 
        url: "", 
        publicId: "", 
        width: undefined, 
        height: undefined,
        altText: "",
        caption: ""
      });
    }
  };

  const handleRemoveBlock = async () => {
    if (block.publicId) {
      setIsDeleting(true);
      try {
        await onDeleteImage(block.publicId);
        onRemove();
        toast.success("Image deleted successfully");
      } catch (error) {
        toast.error("Failed to delete image");
        console.error("Deletion error:", error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      onRemove();
    }
  };

  // Uploading state
  if (isUploading) {
    return (
      <div
        className="relative my-8 flex flex-col items-center justify-center h-48 bg-gray-800/40 rounded-2xl border-2 border-dashed border-purple-500/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          <p className="text-gray-400">Uploading image...</p>
        </motion.div>

        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleRemoveBlock}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md z-10"
            title="Delete"
          >
            <FaTimes size={14} />
          </motion.button>
        )}
      </div>
    );
  }

  // Image display state
  if (hasImage) {
    return (
      <div 
        className="relative my-8 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Close button positioned at top-right corner */}
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleRemoveBlock}
            disabled={isDeleting}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md z-10"
            title="Delete image block"
          >
            {isDeleting ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <FaTimes size={14} />
            )}
          </motion.button>
        )}

        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
          {/* Change button inside the image container */}
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleRemoveImage}
              className="absolute top-4 left-3 flex items-center gap-2 px-3 py-1.5 text-sm bg-white/90 text-gray-900 rounded-full hover:bg-white transition-colors shadow-md z-10"
              title="Change image"
            >
              <FaExchangeAlt size={12} />
              <span className="hidden sm:inline">Change</span>
            </motion.button>
          )}

          {/* Improved image container with better sizing */}
          <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg mb-4">
            <Image
              src={block.url!}
              alt={block.altText || ""}
              width={block.width || 1200}
              height={block.height || 800}
              className="w-full h-auto max-h-96 object-contain"
              onLoad={() => toast.success("Image loaded successfully")}
              onError={() => toast.error("Failed to load image")}
            />
          </div>

          {/* Enhanced caption and alt text inputs */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Caption
                <span className="text-gray-500 text-xs ml-1">(optional)</span>
              </label>
              <textarea
                value={block.caption || ""}
                onChange={handleCaptionChange}
                placeholder="Add a caption for your image..."
                className="w-full p-3 text-sm border border-gray-700 rounded-lg outline-none resize-none bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
                rows={2}
                maxLength={200}
              />
              <div className="absolute bottom-3 right-2 text-xs text-gray-500">
                {block.caption?.length || 0}/200
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alt Text
                <span className="text-gray-500 text-xs ml-1">(for accessibility)</span>
              </label>
              <input
                type="text"
                value={block.altText || ""}
                onChange={handleAltTextChange}
                placeholder="Describe this image for screen readers..."
                className="w-full p-3 text-sm border border-gray-700 rounded-lg outline-none bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
                maxLength={100}
              />
              <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                {block.altText?.length || 0}/100
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
    );
  }

  // Empty state - ready for upload
  return (
    <div
      className="relative my-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Close button for empty image block */}
      {isHovered && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md z-10"
          title="Delete image block"
        >
          <FaTimes size={14} />
        </motion.button>
      )}

      <div className="flex-grow">
        <label
          className={`flex flex-col items-center justify-center w-full h-48 rounded-2xl cursor-pointer transition-all duration-300 p-6
          ${
            isDragging
              ? "border-purple-500 bg-purple-500/5"
              : "border-gray-700 bg-gray-800/40 hover:border-purple-500/50"
          }
          border-2 [border-style:dashed] [border-spacing:20px]`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 mb-4 bg-gray-800 rounded-lg flex items-center justify-center shadow-md border border-gray-700">
              <FiImage className="text-gray-200 text-2xl" />
            </div>
            <p className="text-gray-200 font-semibold">Add an image</p>
            <p className="text-gray-400 text-sm">
              Click to browse or drag & drop ({maxSizeMB}MB max)
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ImageBlock;