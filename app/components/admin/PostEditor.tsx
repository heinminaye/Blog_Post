"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ContentBlockInput,
  ContentBlockType,
  PostResponse,
} from "@/types/post";
import { deleteImage, uploadImage } from "@/lib/uiUtils";
import { FaRegSave, FaGripVertical } from "react-icons/fa";
import { generateSlug } from "@/lib/utils";
import tagsData from "@/data/tags.json";

import TextBlock from "@/components/ui/block/TextBlock";
import ImageBlock from "@/components/ui/block/ImageBlock";
import VideoBlock from "@/components/ui/block/VideoBlock";
import CodeBlock from "@/components/ui/block/CodeBlock";
import DividerBlock from "@/components/ui/block/DividerBlock";
import AddBlockButton from "@/components/ui/block/AddBlockButton";
import CoverImageUpload from "@/components/ui/block/CoverImageUpload";
import {
  FiArrowLeft,
  FiGlobe,
  FiSave,
  FiX,
  FiSearch,
  FiPlus,
} from "react-icons/fi";

interface PostEditorProps {
  initialPost?: PostResponse;
}

// Constants from your schema
const TITLE_MAX_LENGTH = 120;
const EXCERPT_MAX_LENGTH = 300;
const TAG_MAX_LENGTH = 25;

// Generate unique ID for blocks
const generateBlockId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Add id to ContentBlockInput type if needed, or use a wrapper
interface BlockWithId extends ContentBlockInput {
  id: string;
}

export default function PostEditor({ initialPost }: PostEditorProps) {
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [blocks, setBlocks] = useState<BlockWithId[]>(
    initialPost?.content?.map(block => ({
      ...block,
      id: generateBlockId()
    })) || []
  );
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "");
  const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(
    null
  );
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const router = useRouter();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const tagSelectorRef = useRef<HTMLDivElement>(null);

  // Generate slug from title when title changes
  useEffect(() => {
    if (!initialPost && title) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
    }
  }, [title, initialPost]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
    if (excerptRef.current) {
      excerptRef.current.style.height = "auto";
      excerptRef.current.style.height = `${excerptRef.current.scrollHeight}px`;
    }
  }, [title, excerpt]);

  // Close tag selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagSelectorRef.current &&
        !tagSelectorRef.current.contains(event.target as Node)
      ) {
        setShowTagSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enhanced Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, movedBlock);
    
    setBlocks(newBlocks);
    
    if (focusedBlockIndex === draggedIndex) {
      setFocusedBlockIndex(dropIndex);
    } else if (focusedBlockIndex !== null) {
      if (draggedIndex < focusedBlockIndex && dropIndex >= focusedBlockIndex) {
        setFocusedBlockIndex(focusedBlockIndex - 1);
      } else if (draggedIndex > focusedBlockIndex && dropIndex <= focusedBlockIndex) {
        setFocusedBlockIndex(focusedBlockIndex + 1);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTitleChange = (value: string) => {
    if (value.length <= TITLE_MAX_LENGTH) {
      setTitle(value);
    } else {
      toast.error(`Title cannot exceed ${TITLE_MAX_LENGTH} characters`);
    }
  };

  const handleExcerptChange = (value: string) => {
    if (value.length <= EXCERPT_MAX_LENGTH) {
      setExcerpt(value);
    } else {
      toast.error(`Excerpt cannot exceed ${EXCERPT_MAX_LENGTH} characters`);
    }
  };

  const addBlock = (type: ContentBlockType, index?: number) => {
    const newBlock: BlockWithId = {
      type,
      content: type !== "divider" ? "" : undefined,
      id: generateBlockId()
    };

    if (type === "image") {
      newBlock.altText = "";
      newBlock.caption = "";
    }
    if (type === "code") newBlock.language = "javascript";
    if (type === "embed") newBlock.embedType = "youtube";

    if (index !== undefined) {
      setBlocks([
        ...blocks.slice(0, index + 1),
        newBlock,
        ...blocks.slice(index + 1),
      ]);
      setFocusedBlockIndex(index + 1);
    } else {
      setBlocks([...blocks, newBlock]);
      setFocusedBlockIndex(blocks.length);
    }
  };

  const updateBlock = (index: number, updates: Partial<ContentBlockInput>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 0) return;
    setBlocks(blocks.filter((_, i) => i !== index));

    if (focusedBlockIndex === index) {
      setFocusedBlockIndex(Math.max(0, index - 1));
    }
  };

  const handleImageUpload = async (file: File, index: number) => {
    try {
      const result = await uploadImage(file);
      updateBlock(index, {
        url: result.url,
        altText: file.name.split(".")[0],
        width: result.width,
        height: result.height,
        publicId: result.publicId,
      });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Image upload failed");
      console.error("Upload error:", error);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      const result = await uploadImage(file);
      setCoverImage(result.url);
      toast.success("Cover image uploaded successfully");
    } catch (error) {
      toast.error("Cover image upload failed");
      console.error("Upload error:", error);
    }
  };

  const handleRemoveCoverImage = () => {
    setCoverImage("");
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      if (tags.length >= 10) {
        toast.error("Maximum 10 tags allowed");
        return;
      }
      setTags([...tags, tag]);
    }
    setTagSearch("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const validateBlocks = (): boolean => {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (
        block.type === "image" ||
        block.type === "video" ||
        block.type === "embed"
      ) {
        if (!block.url) {
          toast.error(`Block ${i + 1} (${block.type}) requires a URL`);
          setFocusedBlockIndex(i);
          return false;
        }
      }

      if (block.type === "code" && !block.language) {
        toast.error(`Code block ${i + 1} requires a language`);
        setFocusedBlockIndex(i);
        return false;
      }

      if (block.type === "embed" && !block.embedType) {
        toast.error(`Embed block ${i + 1} requires an embed type`);
        setFocusedBlockIndex(i);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    if (!validateBlocks()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const method = initialPost ? "PUT" : "POST";
      const url = initialPost ? `/api/posts/${initialPost._id}` : "/api/posts";

      const contentWithoutIds = blocks.map(({ id, ...block }) => block);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content: contentWithoutIds,
          coverImage: coverImage || undefined,
          tags: tags.map((tag) => tag.toLowerCase().slice(0, TAG_MAX_LENGTH)),
          published: publish,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        toast.error(data.details[0].message || "Failed to save post");
      } else {
        toast.success(publish ? "Post published!" : "Draft saved");
        router.push("/");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save post");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBlock = (block: BlockWithId, index: number) => {
  const isDragged = draggedIndex === index;
  const isDragOver = dragOverIndex === index;
  const isFocused = focusedBlockIndex === index;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragged ? 0.7 : 1, 
        y: 0,
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 35,
        duration: 0.15
      }}
      className={`relative group/block rounded-xl transition-all duration-200 ${
        isDragOver 
          ? 'ring-2 ring-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/10 border border-purple-400/30' 
          : 'border border-transparent'
      } ${
        isDragged 
          ? 'cursor-grabbing z-50 shadow-2xl shadow-purple-500/20 bg-gray-800/80 backdrop-blur-sm' 
          : ''
      }`}
    >
      {/* Enhanced Sidebar with Drag Handle and Close Button - Show on hover OR focus */}
      <div className={`absolute -left-3 top-0 flex items-center gap-1 z-50 transition-all duration-300 ${
        isFocused ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
      }`}>
        {/* Drag Handle */}
        <motion.div
          whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.2)" }}
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing backdrop-blur-sm border border-gray-600/30 shadow-lg"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnd={handleDragEnd}
          title="Drag to reorder"
        >
          <FaGripVertical className="h-4 w-4" />
        </motion.div>
      
      </div>

      {/* Block Content Container */}
      <motion.div 
        className={`transition-all relative duration-200 ${
          isDragged 
            ? 'opacity-80 blur-[1px] scale-105' 
            : 'opacity-100 blur-0 scale-100'
        }`}
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop(index)}
        onDragEnd={handleDragEnd}
      >
        {renderBlockContent(block, index)}
      </motion.div>

      {/* Enhanced Drop Indicator */}
      {isDragOver && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border-2 border-dashed border-purple-400"></div>
        </motion.div>
      )}
    </motion.div>
  );
};

  const renderBlockContent = (block: BlockWithId, index: number) => {
    switch (block.type) {
      case "paragraph":
      case "heading":
      case "quote":
        return (
          <TextBlock
            key={block.id}
            block={block}
            onChange={(updates) => updateBlock(index, updates)}
            onRemove={() => removeBlock(index)}
            isFocused={focusedBlockIndex === index}
            onFocus={() => setFocusedBlockIndex(index)}
            onBlur={() => setFocusedBlockIndex(null)}
          />
        );
      case "image":
        return (
          <ImageBlock
            key={block.id}
            block={block}
            onChange={(updates) => updateBlock(index, updates)}
            onRemove={() => removeBlock(index)}
            onUpload={(file) => handleImageUpload(file, index)}
            onDeleteImage={deleteImage}
          />
        );
      case "video":
      case "embed":
        return (
          <VideoBlock
            key={block.id}
            block={block}
            onChange={(updates) => updateBlock(index, updates)}
            onRemove={() => removeBlock(index)}
          />
        );
      case "code":
        return (
          <CodeBlock
            key={block.id}
            block={block}
            onChange={(updates) => updateBlock(index, updates)}
            onRemove={() => removeBlock(index)}
          />
        );
      case "divider":
        return (
          <DividerBlock 
            key={block.id}
            onRemove={() => removeBlock(index)} 
          />
        );
      default:
        return null;
    }
  };

  // Filter tags based on search
  const filteredTags = tagsData.tags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) && !tags.includes(tag)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header with actions */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14">
            {/* Left section with back button and title */}
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="p-1.5 rounded-md text-gray-200 hover:text-white hover:bg-gray-800 focus:outline-none mr-2 transition-colors group relative"
              >
                <FiArrowLeft className="h-4.5 w-4.5" />
                <div className="absolute -bottom-8 left-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Go back
                </div>
              </button>

              <div>
                <h1 className="text-base sm:text-lg font-semibold text-white">
                  {initialPost ? "Edit Post" : "Create Post"}
                </h1>
                <p className="hidden sm:block text-xs text-gray-400">
                  {initialPost
                    ? "Update your post content"
                    : "Start writing your new post"}
                </p>
              </div>
            </div>

            {/* Right section with action buttons */}
            <div className="flex items-center space-x-2">
              <button
                disabled
                className="hidden sm:flex items-center bg-gray-700 cursor-not-allowed px-3 py-1.5 rounded-md text-gray-400 text-sm font-medium border border-gray-600/50 relative group"
              >
                <FaRegSave className="h-3.5 w-3.5 mr-1.5 opacity-60" />
                <span>Save Draft</span>
                <span className="ml-2 text-[10px] uppercase tracking-wide bg-yellow-500/90 text-black px-1.5 py-0.5 rounded-sm">
                  Coming Soon
                </span>
              </button>

              <button
                disabled
                className="sm:hidden p-2 bg-gray-700 cursor-not-allowed rounded-md text-gray-400 border border-gray-600/50 relative group"
              >
                <FiSave className="h-4 w-4 opacity-60" />
                <div className="absolute -bottom-9 left-0 transform -translate-x-1/2 bg-black/80 text-yellow-300 text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Save Draft (Coming Soon)
                </div>
              </button>

              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="hidden sm:flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3 py-1.5 rounded-md text-white text-sm font-medium transition-all duration-150 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 group relative"
              >
                <FiGlobe className="h-3.5 w-3.5 mr-1.5" />
                <span>{isSubmitting ? "Publishing..." : "Publish"}</span>
              </button>

              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="sm:hidden p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md text-white transition-all duration-150 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 group relative"
              >
                <FiGlobe className="h-4 w-4" />
                <div className="absolute -bottom-9 right-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Publish post
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Editor content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* Cover Image */}
        <CoverImageUpload
          coverImage={coverImage}
          onCoverImageUpload={handleCoverImageUpload}
          onRemoveCoverImage={handleRemoveCoverImage}
        />

        {/* Title */}
        <div className="relative">
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter your post title"
            className="w-full text-3xl font-bold p-0 border-none outline-none resize-none overflow-hidden placeholder:text-gray-400 bg-transparent leading-tight"
            aria-label="Post title"
            rows={1}
          />
          <div className="absolute bottom-1 right-2 text-xs text-gray-500">
            {title.length}/{TITLE_MAX_LENGTH}
          </div>
        </div>

        {/* Slug */}
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">/blog/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            placeholder="post-slug"
            className="w-full p-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 bg-gray-800/50 text-gray-100 placeholder-gray-500 text-sm transition-all border border-gray-700"
            aria-label="Post slug"
          />
        </div>

        {/* Excerpt */}
        <div className="relative">
          <textarea
            ref={excerptRef}
            value={excerpt}
            onChange={(e) => handleExcerptChange(e.target.value)}
            placeholder="Write a brief summary for your readers..."
            className="w-full text-lg text-gray-200 p-0 border-none outline-none resize-none overflow-hidden placeholder:text-gray-400 bg-transparent"
            rows={2}
            aria-label="Post excerpt"
          />
          <div className="absolute bottom-1 right-2 text-xs text-gray-500">
            {excerpt.length}/{EXCERPT_MAX_LENGTH}
          </div>
        </div>

        {/* Tags */}
        <div className="relative" ref={tagSelectorRef}>
          <div
            className={`w-full min-h-12 bg-gray-800/50 border border-gray-700 ${
              showTagSelector
                ? "ring-2 ring-purple-500/30 border-purple-500/50 bg-gray-800/40 shadow-md"
                : "hover:bg-gray-800/40 hover:border-purple-500/30"
            } rounded-lg px-3 py-2 flex flex-wrap gap-2 cursor-text transition-colors`}
            onClick={() => setShowTagSelector(true)}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-purple-600/20 text-purple-300 px-2.5 py-1 rounded-full text-sm group"
              >
                # {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="ml-1.5 text-purple-400 hover:text-purple-200 transition-colors"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              onFocus={() => setShowTagSelector(true)}
              placeholder={tags.length === 0 ? "Add tags..." : ""}
              className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 min-w-[100px]"
            />
          </div>

          <AnimatePresence>
            {showTagSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="relative bottom-0 z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
              >
                <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700 flex-shrink-0">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search tags..."
                      className="w-full pl-9 pr-8 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-purple-500/20 focus:border-purple-500/50 bg-gray-800/50 text-gray-100 placeholder-gray-500 text-sm transition-all border border-gray-700"
                      autoFocus
                    />
                    {tagSearch && (
                      <button
                        onClick={() => setTagSearch("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-2">
                    {filteredTags.length > 0 ? (
                      filteredTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="w-full text-left px-3 py-2 rounded-md mb-1 flex items-center justify-center text-gray-300 hover:bg-gray-700/50 transition-colors group"
                        >
                          <div className="mr-2 h-5 w-3 flex items-center justify-center text-gray-400 group-hover:text-purple-400">
                            #
                          </div>
                          <span className="flex-1">{tag}</span>
                          <FiPlus className="h-4 w-4 text-gray-400 group-hover:text-purple-400" />
                        </button>
                      ))
                    ) : tagSearch ? (
                      <div className="text-gray-400 px-3 py-2 text-sm">
                         {`No tags found matching "${tagSearch}"`}
                      </div>
                    ) : (
                      <div className="text-gray-400 px-3 py-2 text-sm">
                        Type to search tags
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Blocks with Enhanced Sidebar Drag & Drop */}
        <div className="">
          <AnimatePresence>
            {blocks.map((block, index) => (
              <div key={block.id}>
                {renderBlock(block, index)}
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add block button at the end */}
        <div className="">
          <AddBlockButton onAddBlock={(type) => addBlock(type)} />
        </div>
      </motion.div>
    </div>
  );
}