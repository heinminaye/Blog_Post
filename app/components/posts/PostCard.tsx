import Link from 'next/link';
import Image from 'next/image';
import { PostResponse } from '@/types/post';
import { formatDate } from '@/lib/uiUtils';
import { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiEdit, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { deletePost } from '@/lib/api/api';
import { toast } from 'sonner';

interface PostCardProps {
  post: PostResponse;
  hasToken: boolean;
  user: { email: string; role: string } | null;
  onPostDelete?: (postId: string) => void;
}

export default function PostCard({ post, hasToken, user, onPostDelete }: PostCardProps) {
  const isAuthor = hasToken && user?.email === post.author.email;
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target as Node)) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setMenuOpen(false);
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteConfirm(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deletePost(post._id);
      
      if (response.success) {
        if (onPostDelete) {
          onPostDelete(post._id);
        }
        toast.success('Post deleted successfully');
      } else {
         toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setMenuOpen(false);
    }
  };

  return (
    <article className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-purple-500/30 hover:border-purple-500/50 transform hover:-translate-y-1">
      
      {/* Elegant Three-Dot Menu */}
      {hasToken && (
        <div className="absolute top-3.5 right-3.5 z-20" ref={menuRef}>
          <div className="relative">
            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              disabled={isDeleting}
              className="w-8 h-8 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
              aria-label="Post options"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiMoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute right-0 top-10 transition-all duration-200 ${
              menuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
            }`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden w-32">
                {isAuthor ? (
                  <>
                    <Link 
                      href={`/${post.slug}/edit`} 
                      className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FiEdit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    
                    <button 
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="flex items-center gap-2 w-full px-3 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    href={`/${post.slug}`} 
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blur Overlay when delete confirmation is shown */}
      {showDeleteConfirm && (
        <>
          {/* Blur Background */}
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/10 backdrop-blur-sm z-20 rounded-2xl" />
          
          {/* Delete Confirmation - Centered in the card */}
          <div 
            ref={deleteConfirmRef}
            className="absolute inset-0 z-30 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 w-full max-w-[280px] mx-auto">
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
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content Layout */}
      <div className={`flex flex-col h-full ${showDeleteConfirm ? 'opacity-30' : ''}`}>
        
        {/* Cover Image */}
        {post.coverImage && (
          <div className="p-3 pb-0">
            <Link href={`/${post.slug}`} className="block h-full group/image">
              <div className="relative h-54 rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                  } group-hover/image:scale-105`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                  onLoad={() => setImageLoaded(true)}
                  priority={false}
                />
                
                {/* Loading State */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-xl" />
              </div>
            </Link>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 pt-4 flex flex-col">
          <div className="flex-1">
            {/* Title */}
            <h2 className="text-lg font-bold mb-2 leading-tight line-clamp-2 min-h-[2rem]">
              <Link 
                href={`/${post.slug}`} 
                className="text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 block"
              >
                {post.title}
              </Link>
            </h2>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.slice(0, 3).map((tag, idx) => (
                  <span 
                  key={idx}
                  className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-200 text-xs font-medium px-2 py-1 rounded-full border border-pink-500/30 backdrop-blur-sm"
                >
                  # {tag}
                </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300">
                    +{post.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Excerpt */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-pink-500/20">
                  {post.author.name ? post.author.name.charAt(0).toUpperCase() : post.author.email?.charAt(0).toUpperCase()}
                </div>
                {isAuthor && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-500 border-2 border-gray-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {post.author.name || post.author.email?.split('@')[0]}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    <span>•</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
            <Link 
              href={`/${post.slug}`}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium lg:text-sm text-xs transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
              Read more
              <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}