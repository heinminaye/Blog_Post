import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useMemo } from "react";
import tagsData from "@/data/tags.json";

interface CategoryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  disabled?: boolean;
}

export default function CategoryFilters({
  selectedCategory,
  onCategoryChange,
  disabled = false
}: CategoryFiltersProps) {
  const categories = useMemo(() => ["all", ...tagsData.tags], [])

  useEffect(() => {
    if (disabled) return; // Don't setup scroll if disabled
    
    const tagsContainer = document.getElementById("tags-container");
    const leftFade = document.getElementById("left-fade");
    const rightFade = document.getElementById("right-fade");
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");

    if (!tagsContainer || !leftFade || !rightFade || !leftArrow || !rightArrow) return;

    const updateScrollIndicators = () => {
      const { scrollLeft, scrollWidth, clientWidth } = tagsContainer;
      const isAtStart = scrollLeft === 0;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;

      // Update fade effects
      leftFade.style.opacity = isAtStart ? "0" : "1";
      rightFade.style.opacity = isAtEnd ? "0" : "1";

      // Update arrow visibility
      leftArrow.style.opacity = isAtStart ? "0" : "1";
      leftArrow.style.pointerEvents = isAtStart ? "none" : "auto";
      rightArrow.style.opacity = isAtEnd ? "0" : "1";
      rightArrow.style.pointerEvents = isAtEnd ? "none" : "auto";
    };

    // Set up arrow click handlers
    leftArrow.onclick = () => {
      tagsContainer.scrollBy({ left: -200, behavior: "smooth" });
    };

    rightArrow.onclick = () => {
      tagsContainer.scrollBy({ left: 200, behavior: "smooth" });
    };

    // Initial check
    updateScrollIndicators();

    // Add scroll listener
    tagsContainer.addEventListener("scroll", updateScrollIndicators);

    // Add resize listener
    window.addEventListener("resize", updateScrollIndicators);

    // Clean up
    return () => {
      tagsContainer.removeEventListener("scroll", updateScrollIndicators);
      window.removeEventListener("resize", updateScrollIndicators);
    };
  }, [categories, disabled]); // Add disabled to dependencies

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="w-full relative">
        {/* Darker fade effects for better visibility */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 md:w-20 bg-gradient-to-r from-gray-950 via-gray-950 to-transparent pointer-events-none z-10 opacity-0 transition-all duration-500"
          id="left-fade"
        ></div>

        <div
          className="absolute right-0 top-0 bottom-0 w-20 md:w-20 bg-gradient-to-l from-gray-950 via-gray-950 to-transparent pointer-events-none z-10 opacity-100 transition-all duration-500"
          id="right-fade"
        ></div>

        {/* Navigation arrows - Visible on all screens */}
        <button
          id="left-arrow"
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-1.5 shadow-lg transition-all duration-300 opacity-0 pointer-events-none flex items-center justify-center border border-gray-600/50 group backdrop-blur-sm disabled:opacity-30 disabled:pointer-events-none"
          style={{ width: "30px", height: "30px" }}
          disabled={disabled}
        >
          <FiChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-300 group-hover:text-white transition-colors" />
        </button>

        <button
          id="right-arrow"
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-1.5 shadow-lg transition-all duration-300 flex items-center justify-center border border-gray-600/50 group backdrop-blur-sm disabled:opacity-30 disabled:pointer-events-none"
          style={{ width: "30px", height: "30px" }}
          disabled={disabled}
        >
          <FiChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-300 group-hover:text-white transition-colors" />
        </button>

        <div
          className="flex overflow-x-auto px-3 sm:px-5 lg:px-7 py-1 scrollbar-hide"
          id="tags-container"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex py-2 md:py-2.5 space-x-1.5 md:space-x-2 pl-1 pr-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => !disabled && onCategoryChange(category)}
                disabled={disabled}
                className={`group font-bold whitespace-nowrap px-3 py-1.5 md:px-3.5 md:py-2 text-xs rounded-lg transition-all duration-300 flex-shrink-0 flex items-center space-x-1.5 border ${
                  disabled 
                    ? "bg-gray-800/40 text-gray-500 border-gray-600/20 cursor-not-allowed" 
                    : selectedCategory === category
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20"
                    : "bg-gray-800/70 text-gray-200 border-gray-600/40 hover:bg-gray-700/80 hover:text-white hover:border-purple-400/60"
                }`}
              >
                <span
                  className={`${
                    disabled
                      ? "text-gray-500"
                      : selectedCategory === category
                      ? "text-white drop-shadow-sm"
                      : "text-gray-400 group-hover:text-purple-200"
                  }`}
                >
                  #
                </span>
                <span
                  className={`tracking-wide capitalize ${
                    disabled
                      ? "text-gray-500"
                      : selectedCategory === category
                      ? "text-white drop-shadow-sm"
                      : "text-gray-100 group-hover:text-white"
                  }`}
                >
                  {category === "all" ? "All" : category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Loading indicator when disabled */}
      {disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-30"
        >
          <div className="flex items-center gap-2 bg-gray-800/90 px-3 py-1.5 rounded-full border border-gray-700/50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full"
            />
            <span className="text-xs text-gray-300">Applying filter...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}