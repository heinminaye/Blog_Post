import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 lg:mb-8 overflow-hidden px-5 md:px-8"
        >
          <div className="bg-red-900/30 border-l-4 border-red-400 p-4 lg:p-5 rounded-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <FiAlertCircle className="h-5 w-5 lg:h-6 lg:w-6 text-red-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <h3 className="text-base lg:text-lg font-medium text-red-200">
                  Something went wrong
                </h3>
                <p className="text-red-100 mt-1 text-sm lg:text-base">
                  {error}
                </p>
                <button
                  onClick={onRetry}
                  className="mt-2 lg:mt-3 inline-flex items-center text-xs lg:text-sm font-medium text-red-300 hover:text-red-100 transition-colors bg-red-900/40 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg"
                >
                  <FiRefreshCw className="mr-1.5 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}