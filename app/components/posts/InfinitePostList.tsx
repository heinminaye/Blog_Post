"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "./PostCard";
import PostSkeleton from "../ui/InfinitedPost/PostSkeleton";
import Navigation from "../ui/Navigation";
import CategoryFilters from "../ui/InfinitedPost/CategoryFilters";
import ErrorState from "../ui/InfinitedPost/ErrorState";
import EmptyState from "../ui/InfinitedPost/EmptyState";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFetchingNewData, setIsFetchingNewData] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { hasToken, user, loading: authLoading } = useAuthToken();

  const hasFetched = useRef(false);

  const fetchPostsData = useCallback(
    async (
      page: number,
      search: string = "",
      category: string = "all",
      isNewSearch: boolean = false
    ) => {
      if (isNewSearch) setIsFetchingNewData(true);
      setLoading(true);
      setError(null);

      try {
        const tag = category !== "all" ? category : null;
        const response: ApiResponse<PaginatedPostResponse> = await fetchPosts(
          page,
          12,
          search,
          tag
        );

        if (!response.success) throw new Error(response.message || "Failed to fetch posts");

        setPosts((prev) => (page === 1 ? response.data.data : [...prev, ...response.data.data]));
        setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
      } catch (err: unknown) {
        console.error("Error fetching posts:", err);
        if (err instanceof Error && err.message.includes("Network")) {
          setError("Connection issue. Please check your internet.");
        } else {
          setError("Failed to fetch posts");
        }
      } finally {
        setLoading(false);
        setIsFetchingNewData(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!hasFetched.current) {
      fetchPostsData(1, searchQuery, selectedCategory, true);
      hasFetched.current = true;
    }
  }, []);

  // 🔍 Search & category updates
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        fetchPostsData(1, searchQuery, selectedCategory, true);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory]);

  // ♾️ Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingNewData) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.2 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading, isFetchingNewData]);

  // 📄 Fetch next pages
  useEffect(() => {
    if (page > 1) fetchPostsData(page, searchQuery, selectedCategory);
  }, [page]);

  // 📱 Responsive search toggle
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSearchExpanded) setIsSearchExpanded(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSearchExpanded]);

  // 🔧 Handlers
  const handleSearchFocus = () => {
    if (window.innerWidth < 768) setIsSearchExpanded(true);
  };
  const handleSearchBlur = () => {
    setTimeout(() => {
      if (window.innerWidth < 768 && !searchQuery) setIsSearchExpanded(false);
    }, 200);
  };
  const handleMobileSearchClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  };
  const handleBackButtonClick = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
    searchRef.current?.blur();
  };

  const handleSearchChange = useCallback((query: string) => {
    setIsFetchingNewData(true);
    setPosts([]);
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setIsFetchingNewData(true);
    setPosts([]);
    setSelectedCategory(category);
    setPage(1);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    if (window.innerWidth < 768) setIsSearchExpanded(false);
  };

  const handlePostDelete = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((post) => post._id !== deletedPostId));
  };

  const handleRetry = () => {
    fetchPostsData(1, searchQuery, selectedCategory, true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center overflow-x-hidden">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col">
      {/* 🧭 Navigation */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50">
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
              disabled={isFetchingNewData}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 📰 Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {error && <ErrorState key="error" error={error} onRetry={handleRetry} />}
        </AnimatePresence>

        <div className="py-6">
          <AnimatePresence mode="wait">
            {(posts.length > 0 || loading || isFetchingNewData) && (
              <motion.div
                key={isFetchingNewData ? "loading" : "posts"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
              >
                {posts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="w-full"
                  >
                    <PostCard post={post} hasToken={hasToken} user={user} onPostDelete={handlePostDelete} />
                  </motion.div>
                ))}

                {(loading || isFetchingNewData) &&
                  [...Array(6)].map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <PostSkeleton />
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && !isFetchingNewData && posts.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <EmptyState searchQuery={searchQuery} selectedCategory={selectedCategory} onClearSearch={handleClearSearch} />
            </motion.div>
          )}

          {!loading && !isFetchingNewData && hasMore && posts.length > 0 && (
            <div ref={loaderRef} className="h-20 flex justify-center items-center mt-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-gray-400">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm">Loading more articles...</p>
              </motion.div>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                <FiCheck className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">{`You've seen it all!`}</h3>
              <p className="text-gray-500 text-sm mb-4">No more articles to load</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors bg-gray-800/50 rounded-lg border border-gray-700/50"
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
