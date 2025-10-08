import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
interface EmptyStateProps {
  searchQuery: string;
  selectedCategory?: string;
  onClearSearch: () => void;
}

export const EmptyState = ({ 
  searchQuery, 
  selectedCategory = "all", 
  onClearSearch 
}: EmptyStateProps) => {
  return (
    <div className="text-center py-16 lg:py-24">
      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center mx-auto mb-6 lg:mb-8 border border-gray-700/50">
        <FiSearch className="w-10 h-10 lg:w-12 lg:h-12 text-gray-500" />
      </div>
      <h3 className="text-xl lg:text-2xl font-semibold text-gray-300 mb-2 lg:mb-3">
        {searchQuery ? "No articles found" : "No articles available"}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6 lg:mb-8">
        {searchQuery 
          ? `No articles found for "${searchQuery}"${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}. Try adjusting your search or filter.`
          : selectedCategory !== 'all' 
            ? `No articles available in ${selectedCategory} category.`
            : "No articles have been published yet."
        }
      </p>
      {(searchQuery || selectedCategory !== 'all') && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearSearch}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Clear {searchQuery && selectedCategory !== 'all' ? 'filters' : searchQuery ? 'search' : 'filter'}
        </motion.button>
      )}
    </div>
  );
};