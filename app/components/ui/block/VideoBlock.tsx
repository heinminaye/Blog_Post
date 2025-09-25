"use client";

import { useState, useEffect } from "react";
import {
  FaLink,
  FaTimes,
  FaYoutube,
  FaQuestionCircle,
  FaExchangeAlt,
} from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { ContentBlockInput, EmbedType } from "@/types/post";
import { toast } from "sonner";

interface VideoBlockProps {
  block: ContentBlockInput;
  onChange: (updates: Partial<ContentBlockInput>) => void;
  onRemove: () => void;
}

const VideoBlock = ({ block, onChange, onRemove }: VideoBlockProps) => {
  const [url, setUrl] = useState<string>(block.url || "");
  const [embedType, setEmbedType] = useState<EmbedType>(
    block.embedType || "unknown"
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  let detected: EmbedType = "unknown";

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    detected = "youtube";
  } else if (url.includes("tiktok.com")) {
    detected = "tiktok";
  }

  // only update if block data is outdated
    if (block.embedType !== detected || block.url !== url) {
      setEmbedType(detected); 
      onChange({ embedType: detected, url });
    }
}, [url, onChange, block.embedType, block.url]);

  const getEmbedUrl = () => {
    if (embedType === "youtube") {
      const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      return match ? `https://www.youtube.com/embed/${match[1]}` : "";
    } else if (embedType === "tiktok") {
      const match = url.match(
        /(?:tiktok\.com\/)(?:@[\w.-]+\/video\/|v\/)(\d+)/
      );
      return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : "";
    }
    return "";
  };

  const getPlatformIcon = () => {
    switch (embedType) {
      case "youtube":
        return <FaYoutube className="text-red-500" size={18} />;
      case "tiktok":
        return <SiTiktok className="text-black dark:text-white" size={16} />;
      default:
        return <FaQuestionCircle className="text-gray-400" size={16} />;
    }
  };

  const getPlatformName = () => {
    switch (embedType) {
      case "youtube":
        return "YouTube";
      case "tiktok":
        return "TikTok";
      default:
        return "Video";
    }
  };

  const embedUrl = getEmbedUrl();

  return (
    <div
      className="relative my-6 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Remove Button */}
      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all shadow-md z-10"
            title="Remove video"
          >
            <FaTimes size={14} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex-grow">
        {embedUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative rounded-xl overflow-hidden bg-black border border-gray-700 shadow-lg"
          >
            {/* Video Embed */}
            <div className="relative w-full h-0 pb-[56.25%]">
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Embedded ${embedType} content`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  toast.error("Failed to load video");
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>

            {/* Platform Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/80 rounded-full backdrop-blur-sm border border-gray-600"
            >
              {getPlatformIcon()}
              <span className="text-xs text-white font-medium">
                {getPlatformName()}
              </span>
            </motion.div>

            {/* Change Button */}
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              onClick={() => {
                setUrl("");
                setEmbedType("unknown");
              }}
              className="absolute top-3 right-4 flex items-center gap-2 px-3 py-1.5 text-sm bg-white/90 text-gray-900 rounded-full hover:bg-white transition-all shadow-md"
              title="Change video URL"
            >
              <FaExchangeAlt size={12} />
              <span className="hidden sm:inline">Change</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`p-3 rounded-xl ${
                  embedType === "unknown"
                    ? "bg-gray-700"
                    : embedType === "youtube"
                    ? "bg-red-900/30"
                    : "bg-blue-900/30"
                }`}
              >
                {getPlatformIcon()}
              </motion.div>

              <div>
                <h3 className="font-semibold text-white text-lg">
                  Embed Video
                </h3>

                {/* Supported platforms row */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="flex items-center gap-3 text-xs text-gray-400"
                >
                  <span className="flex items-center gap-1">
                    <FaYoutube className="text-red-500" size={14} />
                    YouTube
                  </span>
                  <span className="flex items-center gap-1">
                    <SiTiktok
                      className="text-black dark:text-white"
                      size={10}
                    />
                    TikTok
                  </span>
                </motion.div>
              </div>
            </div>

            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/... or https://tiktok.com/..."
                className="w-full p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 bg-gray-800/50 text-gray-100 placeholder-gray-500 text-sm transition-all border border-gray-700"
              />
              <FaLink
                className="absolute left-3 top-4 text-gray-400"
                size={14}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoBlock;