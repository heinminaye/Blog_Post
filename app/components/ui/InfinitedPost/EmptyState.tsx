import { motion } from "framer-motion";
import { FiSearch, FiFileText, FiFrown, FiBookOpen, FiFilter } from "react-icons/fi";

interface EmptyStateProps {
  searchQuery: string;
  selectedCategory?: string;
  onClearSearch: () => void;
}

export default function EmptyState({ 
  searchQuery, 
  selectedCategory = "all", 
  onClearSearch 
}: EmptyStateProps) {
  const hasActiveFilters = searchQuery || selectedCategory !== "all";
  const isCategoryFilter = selectedCategory !== "all" && !searchQuery;
  const isSearchOnly = searchQuery && selectedCategory === "all";
  const isCombinedFilter = searchQuery && selectedCategory !== "all";

  const getIcon = () => {
    if (isCombinedFilter) return <FiSearch className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" />;
    if (isSearchOnly) return <FiSearch className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" />;
    if (isCategoryFilter) return <FiFilter className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" />;
    return <FiFileText className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" />;
  };

  const getSubIcon = () => {
    if (isCombinedFilter) return <FiFilter className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />;
    if (isSearchOnly) return <FiFrown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />;
    if (isCategoryFilter) return <FiFrown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />;
    return <FiBookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />;
  };

  const getMessage = () => {
    if (isCombinedFilter) {
      return `No results found for "${searchQuery}" in ${selectedCategory} category`;
    }
    if (isSearchOnly) {
      return `No results found for "${searchQuery}"`;
    }
    if (isCategoryFilter) {
      return `No articles found in ${selectedCategory} category`;
    }
    return "No articles available yet";
  };

  const getButtonText = () => {
    if (isCombinedFilter) return "Clear All Filters";
    if (isSearchOnly) return "Clear Search";
    if (isCategoryFilter) return "Clear Filter";
    return "Browse all";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="flex flex-col items-center justify-center min-h-80 py-8 lg:py-12 px-4 col-span-full text-center"
    >
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative mb-4 lg:mb-5"
      >
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-full flex items-center justify-center shadow-lg">
          {getIcon()}
        </div>
        <div className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-6 h-6 lg:w-8 lg:h-8 bg-gray-800 rounded-full border-4 border-gray-950 flex items-center justify-center shadow-lg">
          {getSubIcon()}
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl lg:text-2xl font-semibold text-gray-300 mb-2"
      >
        {hasActiveFilters ? "No articles found" : "No articles yet"}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 max-w-md mx-auto text-base lg:text-lg mb-6"
      >
        {getMessage()}
      </motion.p>

      {hasActiveFilters && (
        <motion.button
  initial={{ opacity: 0, y: 40, scale: 0.8, rotateX: 15 }}
  animate={{
    opacity: 1,
    y: [40, -10, 0],
    scale: [0.8, 1.05, 1],
    rotateX: [15, -5, 0],
  }}
  transition={{
    delay: 0.1,
    duration: 0.2,
    ease: [0.25, 0.46, 0.45, 0.94],
  }}
  whileHover={{
    scale: 1.05,
    y: -3,
    boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)",
  }}
  whileTap={{ scale: 0.95, y: 0 }}
  onClick={onClearSearch}
  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white 
             rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 
             transition-all duration-300 text-sm shadow-lg shadow-purple-500/20"
>
  {getButtonText()}
</motion.button>

      )}

      {/* Additional helpful text for empty state */}
      {!hasActiveFilters && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 text-sm mt-4 max-w-sm"
        >
          Check back later for new content or explore other categories
        </motion.p>
      )}
    </motion.div>
  );
}