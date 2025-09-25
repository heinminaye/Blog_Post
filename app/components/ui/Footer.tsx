import { motion } from "framer-motion";
import { FiBookOpen } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800/50 py-5 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <div className="flex items-center mb-4 md:mb-0">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="h-6 w-6 lg:h-8 lg:w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 lg:mr-3 shadow-lg"
            >
              <FiBookOpen className="h-3 w-3 lg:h-5 lg:w-5 text-white" />
            </motion.div>
            <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              InsightReads
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center space-x-4 lg:space-x-6 text-xs lg:text-sm text-gray-500"
          >
            <span>© {new Date().getFullYear()} InsightReads</span>
            <span className="hidden md:block">•</span>
            <span className="hidden md:block">Curated Knowledge Hub</span>
            <span className="hidden md:block">•</span>
            <span>All rights reserved</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}