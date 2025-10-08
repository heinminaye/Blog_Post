import { motion } from "framer-motion";

export default function PostSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700"
    >
      {/* Menu Button Skeleton */}
      <div className="absolute top-3.5 right-3.5 z-30">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 backdrop-blur-sm shadow-sm border border-gray-200/50 dark:border-gray-600/50 animate-pulse" />
      </div>

      {/* Content Layout */}
      <div className="flex flex-col h-full">
        {/* Cover Image Skeleton */}
        <div className="p-3 pb-0">
          <div className="relative h-54 rounded-xl overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 pt-4 flex flex-col">
          <div className="flex-1">
            {/* Title Skeleton */}
            <div className="mb-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Tags Skeleton */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-14 animate-pulse"></div>
            </div>

            {/* Excerpt Skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
            </div>

            {/* Author Info Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 animate-pulse"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}