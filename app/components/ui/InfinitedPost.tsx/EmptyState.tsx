import { motion } from "framer-motion";
import { FiSearch, FiFileText, FiFrown, FiBookOpen } from "react-icons/fi";

interface EmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export default function EmptyState({ searchQuery, onClearSearch }: EmptyStateProps) {
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
          {searchQuery ? (
            <FiSearch className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" />
          ) : (
            <FiFileText className="w-8 h-8 lg:w-10 lg:h-10 text-purple-400" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 lg:-bottom-2 lg:-right-2 w-6 h-6 lg:w-8 lg:h-8 bg-gray-800 rounded-full border-4 border-gray-950 flex items-center justify-center shadow-lg">
          {searchQuery ? (
            <FiFrown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
          ) : (
            <FiBookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
          )}
        </div>
      </motion.div>

      <p className="text-gray-400 max-w-md mx-auto text-base lg:text-lg mb-4 ">
        {searchQuery
          ? `No results found for "${searchQuery}"`
          : "No articles available yet"}
      </p>

      {searchQuery && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearSearch}
          className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all duration-300 text-sm"
        >
          Clear search
        </motion.button>
      )}
    </motion.div>
  );
}