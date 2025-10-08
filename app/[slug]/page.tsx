"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "@/lib/uiUtils";
import Image from "next/image";
import Link from "next/link";
import { fetchPostBySlug, deletePost } from "@/lib/api/api";
import LoadingDots from "@/components/ui/LoadingDots";
import { PostResponse } from "@/types/post";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaQuoteLeft,
  FaJava,
  FaMinus,
  FaCopy,
  FaCheck,
  FaYoutube,
  FaQuestionCircle,
} from "react-icons/fa";
import { FiArrowLeft, FiEdit3, FiTrash2, FiShare2 } from "react-icons/fi";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiHtml5,
  SiCss3,
  SiMysql,
  SiTiktok,
} from "react-icons/si";
import { toast } from "sonner";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasToken, user } = useAuthToken();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});
  const [isSharing, setIsSharing] = useState(false);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  // Process text content to handle basic HTML tags
  const processTextContent = (text: string) => {
    if (!text) return "";
    
    return text
      .replace(/<b>(.*?)<\/b>/g, '<strong class="font-bold">$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em class="italic">$1</em>')
      .replace(/<code>(.*?)<\/code>/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-green-300">$1</code>')
      .replace(/<br\s*\/?>/g, '<br />');
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDeleteConfirm) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";

      return () => {
        const scrollTop = -parseInt(document.body.style.top || "0", 10);
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollTop);
      };
    }
  }, [showDeleteConfirm]);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchPostBySlug(params.slug as string);

        if (!response.success) {
          setError(response.message || "Failed to fetch post");
          return;
        }

        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params.slug]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        deleteConfirmRef.current &&
        !deleteConfirmRef.current.contains(event.target as Node)
      ) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const loadPost = async () => {
        try {
          const response = await fetchPostBySlug(params.slug as string);
          if (response.success) {
            setPost(response.data);
            setError(null);
          } else {
            setError(response.message || "Failed to fetch post");
          }
        } catch (error: unknown) {
          console.error("Error fetching post:", error);
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      loadPost();
    }, 1000);
  };

  const setCopied = (index: number) => {
    setCopiedStates((prev) => ({ ...prev, [index]: true }));
    setTimeout(
      () => setCopiedStates((prev) => ({ ...prev, [index]: false })),
      2000
    );
  };

  const handleCopyCode = async (codeContent: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(codeContent || "");
      setCopied(blockIndex);
      // toast.success("Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleShare = async () => {
    if (!post) return;

    setIsSharing(true);
    try {
      const shareData = {
        title: post.title,
        text: post.excerpt || post.title,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteConfirm(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!post) return;

    setIsDeleting(true);
    try {
      const response = await deletePost(post._id);

      if (response.success) {
        toast.success("Post deleted successfully");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        throw new Error(response.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center overflow-x-hidden">
        <LoadingDots />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-pink-300 hover:text-pink-100 transition-colors text-sm group"
            >
              <FiArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Posts
            </Link>
          </nav>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg transition-colors"
              >
                Back to Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-pink-300 hover:text-pink-100 transition-colors text-sm group"
            >
              <FiArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Posts
            </Link>
          </nav>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Post Not Found
            </h2>
            <p className="text-gray-400 mb-6">
              {`The post you're looking for doesn't exist or may have been removed.`}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              Back to Posts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = hasToken && user?.email === post.author.email;

  // Language options for code blocks
  const languageOptions = [
    {
      id: "javascript",
      name: "JavaScript",
      icon: <SiJavascript size={16} className="text-yellow-400" />,
      color: "text-yellow-400"
    },
    {
      id: "typescript",
      name: "TypeScript",
      icon: <SiTypescript size={16} className="text-blue-500" />,
      color: "text-blue-500"
    },
    {
      id: "python",
      name: "Python",
      icon: <SiPython size={16} className="text-blue-400" />,
      color: "text-blue-400"
    },
    {
      id: "java",
      name: "Java",
      icon: <FaJava size={16} className="text-red-500" />,
      color: "text-red-500"
    },
    {
      id: "html",
      name: "HTML",
      icon: <SiHtml5 size={16} className="text-orange-500" />,
      color: "text-orange-500"
    },
    {
      id: "css",
      name: "CSS",
      icon: <SiCss3 size={16} className="text-blue-600" />,
      color: "text-blue-600"
    },
    {
      id: "sql",
      name: "SQL",
      icon: <SiMysql size={16} className="text-blue-700" />,
      color: "text-blue-700"
    },
  ];

  return (
    <article className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            ref={deleteConfirmRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 w-full max-w-[280px] mx-auto"
          >
            {/* Icon Header */}
            <div className="flex flex-col items-center p-5">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
                <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 text-center">
                Delete Post?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                This action cannot be undone
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting</span>
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <nav className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
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

              <div className="max-w-[200px] sm:max-w-none truncate">
                <h1 className="text-base sm:text-lg font-semibold text-white truncate">
                  {post.title}
                </h1>
                <p className="hidden sm:block text-xs text-gray-400">
                  Published on {formatDate(post.publishedAt || post.createdAt)}
                </p>
              </div>
            </div>

            {/* Right section with action buttons */}
            <div className="flex items-center space-x-2">
              {/* Share Button */}
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors border border-gray-700/30 group relative"
              >
                {isSharing ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiShare2 className="h-4 w-4" />
                )}
                <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Share post
                </div>
              </button>

              {/* Edit - Desktop */}
              {isAuthor && (
                <Link
                  href={`/admin/posts/${post.slug}/edit`}
                  className="hidden sm:flex items-center bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md text-gray-300 text-sm font-medium transition-colors duration-150 border border-gray-700/30 group relative"
                >
                  <FiEdit3 className="h-3.5 w-3.5 mr-1.5" />
                  <span>Edit</span>
                </Link>
              )}

              {/* Delete - Desktop */}
              {isAuthor && (
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="hidden sm:flex items-center bg-red-800/80 hover:bg-red-700 px-3 py-1.5 rounded-md text-red-200 text-sm font-medium transition-colors duration-150 border border-red-700/30 group relative disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-200 border-t-transparent rounded-full animate-spin mr-1.5" />
                  ) : (
                    <FiTrash2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              )}

              {/* Edit - Mobile */}
              {isAuthor && (
                <>
                  <Link
                    href={`/admin/posts/${post.slug}/edit`}
                    className="sm:hidden p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors border border-gray-700/30 group relative"
                  >
                    <FiEdit3 className="h-4 w-4" />
                    <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Edit post
                    </div>
                  </Link>

                  {/* Delete - Mobile */}
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="sm:hidden p-2 bg-red-800/80 hover:bg-red-700 rounded-md text-red-200 transition-colors border border-red-700/30 group relative disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-red-200 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="h-4 w-4" />
                    )}
                    <div className="absolute -bottom-9 right-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {isDeleting ? "Deleting..." : "Delete post"}
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/30 rounded-2xl p-6 border border-gray-700/50"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-md text-gray-300 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FaCalendarAlt className="text-pink-400" size={14} />
                <span className="font-medium text-pink-200">
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span className="w-1 h-1 rounded-full bg-pink-500/60"></span>
                <FaClock className="text-purple-400" size={14} />
                <span className="text-purple-200/80">
                  {post.readingTime} min read
                </span>
              </div>
            </div>

            {/* Author info */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-pink-500/20">
                  {post.author.name
                    ? post.author.name.charAt(0).toUpperCase()
                    : post.author.email?.charAt(0).toUpperCase()}
                </div>
                {isAuthor && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-500 border-2 border-gray-900 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2 w-2 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-pink-100">
                  {post.author.name || post.author.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-400">
                  {post.author.email}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-200 text-xs font-medium px-3 py-1.5 rounded-full border border-pink-500/30 backdrop-blur-sm"
                >
                  # {tag}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        {/* Cover Image */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-gray-700/50"
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
          </motion.div>
        )}

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg prose-invert max-w-none bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 rounded-2xl p-6 border border-gray-700/50"
        >
          {post.content.map((block, index) => {
            switch (block.type) {
              case "paragraph":
                return (
                  <div
                    key={index}
                    className="text-md leading-relaxed mb-4 text-gray-200"
                    dangerouslySetInnerHTML={{ 
                      __html: processTextContent(block.content || "") 
                    }}
                  />
                );
              case "heading":
                return (
                  <h2
                    key={index}
                    className="text-xl font-bold my-2 text-white"
                    dangerouslySetInnerHTML={{ 
                      __html: processTextContent(block.content || "") 
                    }}
                  />
                );
              case "image":
                return (
                  <figure key={index} className="my-8">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-700">
                      <Image
                        src={block.url || ""}
                        alt={block.altText || ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                        priority={index < 2}
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="text-center text-sm text-gray-400 mt-3 italic">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              case "code":
                const languageData = languageOptions.find(
                  (lang) => lang.id === block.language
                ) || languageOptions[0];

                return (
                  <div key={index} className="my-6 bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <div className="bg-gray-800 p-2 pl-4 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm font-mono text-gray-300">
                        {languageData.icon}
                        <span className={languageData.color}>
                          {block.language || "javascript"}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyCode(block.content || "", index)
                        }
                        className="px-3 py-1.5 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-300 hover:text-white border border-gray-600 text-xs font-medium"
                      >
                        {copiedStates[index] ? (
                          <>
                            <FaCheck className="text-green-400" size={12} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <FaCopy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 bg-gray-900">
                      <pre className="overflow-x-auto text-sm text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                        <code>{block.content || ""}</code>
                      </pre>
                    </div>
                  </div>
                );
              case "video":
              case "embed": {
                const videoUrl = block.url || block.content || "";
                const embedType = block.embedType || "unknown";

                const getEmbedUrl = () => {
                  if (embedType === "youtube") {
                    const match = videoUrl.match(
                      /(?:youtube\.com\/(?:.*v=|.*shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/
                    );
                    return match
                      ? `https://www.youtube.com/embed/${match[1]}`
                      : "";
                  } else if (embedType === "tiktok") {
                    const match = videoUrl.match(/video\/(\d+)/);
                    return match
                      ? `https://www.tiktok.com/embed/v2/${match[1]}`
                      : "";
                  }
                  return "";
                };

                const getPlatformIcon = () => {
                  switch (embedType) {
                    case "youtube":
                      return <FaYoutube className="text-red-500" size={18} />;
                    case "tiktok":
                      return (
                        <SiTiktok
                          className="text-black dark:text-white"
                          size={16}
                        />
                      );
                    default:
                      return (
                        <FaQuestionCircle className="text-gray-400" size={16} />
                      );
                  }
                };

                const embedUrl = getEmbedUrl();

                return (
                  <div key={index} className="my-6">
                    {embedUrl ? (
                      <div className="relative rounded-xl overflow-hidden bg-black border border-gray-700 shadow-lg">
                        <div className="relative w-full h-0 pb-[56.25%]">
                          <iframe
                            src={embedUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title={`Embedded ${embedType} content`}
                          />
                        </div>

                        {/* Platform badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/80 rounded-full backdrop-blur-sm border border-gray-600">
                          {getPlatformIcon()}
                          <span className="text-xs text-white font-medium capitalize">
                            {embedType}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg border border-red-400/20">
                        Invalid embed URL
                      </div>
                    )}

                    {block.caption && (
                      <p className="text-center text-sm text-gray-400 mt-3 italic">
                        {block.caption}
                      </p>
                    )}
                  </div>
                );
              }
              case "quote":
                return (
                  <blockquote
                    key={index}
                    className="my-6 pl-6 pr-4 py-2 relative  border-l-4 border-purple-500 bg-gray-700/30 rounded-lg"
                  >
                    <div className="absolute top-2 left-3 text-purple-500">
                      <FaQuoteLeft size={20} />
                    </div>
                    <p 
                      className="text-lg italic text-gray-200 pl-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: processTextContent(block.content || "") 
                      }}
                    />
                  </blockquote>
                );
              case "divider":
                return (
                  <div key={index} className="my-8 group">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600 group-hover:border-purple-500/50 transition-colors duration-300" />
                      </div>

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
                );
              default:
                return null;
            }
          })}
        </motion.div>

        {/* Article Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>Thanks for reading! If you enjoyed this post, please share it with others.</p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiShare2 className="h-4 w-4" />
              Share this post
            </button>
          </div>
        </motion.footer>
      </div>
    </article>
  );
}