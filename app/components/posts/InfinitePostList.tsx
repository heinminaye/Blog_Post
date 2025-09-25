"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "./PostCard";
import PostSkeleton from "../ui/InfinitedPost.tsx/PostSkeleton";
import Navigation from "../ui/Navigation";
import CategoryFilters from "../ui/InfinitedPost.tsx/CategoryFilters";
import ErrorState from "../ui/InfinitedPost.tsx/ErrorState";
import EmptyState from "../ui/InfinitedPost.tsx/EmptyState";
import Footer from "../ui/Footer";
import { PostResponse, PaginatedPostResponse, ApiResponse } from "@/types/post";
import { FiCheck } from "react-icons/fi";
import { fetchPosts } from "@/lib/api/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import LoadingDots from "../ui/LoadingDots";

export default function InfinitePostList() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { hasToken, user, loading: authLoading } = useAuthToken();

  const fetchPostsData = useCallback(
    async (page: number, search: string = "", category: string = "all") => {
      setLoading(true);
      setError(null);

      try {
        const tag = category !== "all" ? category : null;
        const response: ApiResponse<PaginatedPostResponse> = await fetchPosts(page, 12, search, tag);
        
        if (!response.success) {
          setError(response.message || "Failed to fetch posts");
        }
        
        setPosts((prev) =>
          page === 1 ? response.data.data : [...prev, ...response.data.data]
        );
        setHasMore(
          response.data.pagination.page < response.data.pagination.totalPages
        );
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch posts";
        setError(errorMessage);
        console.error("Error:", err);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    []
  );

  // Initial load and search handler
  useEffect(() => {
    fetchPostsData(1, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, fetchPostsData]);

  // Manual scroll detection handler
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isSearching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, isSearching]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1 && !isSearching) {
      fetchPostsData(page, searchQuery, selectedCategory);
    }
  }, [page, searchQuery, isSearching, selectedCategory, fetchPostsData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSearchExpanded]);

  // Handle mobile search expansion
  const handleSearchFocus = () => {
    if (window.innerWidth < 768) {
      setIsSearchExpanded(true);
    }
  };

  const handleSearchBlur = () => {
    // Don't collapse immediately on blur to allow for button clicks
    setTimeout(() => {
      if (window.innerWidth < 768 && !searchQuery) {
        setIsSearchExpanded(false);
      }
    }, 200);
  };

  const handleMobileSearchClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      searchRef.current?.focus();
    }, 100);
  };

  const handleBackButtonClick = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
    searchRef.current?.blur();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(true);
    setPage(1);
    if (window.innerWidth < 768) {
      setIsSearchExpanded(false);
    }
  };
  const handlePostDelete = (deletedPostId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col">
      <Navigation
        ref={searchRef}
        isSearchExpanded={isSearchExpanded}
        searchQuery={searchQuery}
        postsCount={posts.length}
        onSearchChange={handleSearchChange}
        onMobileSearchClick={handleMobileSearchClick}
        onBackButtonClick={handleBackButtonClick}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        hasToken={hasToken}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full">
        {/* Hide category filters when search is expanded on mobile */}
        <AnimatePresence>
         
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryFilters
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </motion.div>

        </AnimatePresence>

        <ErrorState 
          error={error} 
          onRetry={() => fetchPostsData(1, searchQuery, selectedCategory)} 
        />

        <div className="grid grid-cols-1  md:grid-cols-2 xl:grid-cols-3 px-4 sm:px-6 lg:px-8 gap-6 lg:gap-8">
          <AnimatePresence mode="wait">
            {posts.length > 0 ? (
              <>
                {posts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    layout
                    className="transform hover:scale-[1.01] transition-transform duration-300"
                  >
                    <PostCard 
                      post={post} 
                      hasToken={hasToken}
                      user={user}
                      onPostDelete={handlePostDelete}
                    />
                  </motion.div>
                ))}
              </>
            ) : !loading ? (
              <div className="col-span-2 lg:col-span-3">
                <EmptyState 
                  searchQuery={searchQuery} 
                  onClearSearch={handleClearSearch} 
                />
              </div>
            ) : null}
          </AnimatePresence>

          {/* Loading Skeletons */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 py-5 col-span-2 "
            >
              {[...Array(4)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </motion.div>
          )}

          {/* Infinite Scroll Trigger */}
          {!loading && hasMore && (
            <div
              ref={loaderRef}
              className="h-20 lg:h-24 flex justify-center items-center col-span-2"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="h-8 w-8 lg:h-10 lg:w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">
                  Loading more articles...
                </p>
              </motion.div>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-12 lg:py-16 text-gray-400 col-span-full"
            >
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-purple-900/20 to-pink-900/20 flex items-center justify-center mb-4 lg:mb-5 shadow-lg">
                <FiCheck className="w-8 h-8 lg:w-10 lg:h-10 text-purple-500" />
              </div>
              <p className="text-lg lg:text-xl font-medium text-gray-300 mb-1 lg:mb-2">
                You've reached the end
              </p>
              <p className="text-gray-500 text-sm lg:text-base">
                No more articles to load
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-6 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors bg-gray-800/50 rounded-lg"
              >
                Back to top
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}