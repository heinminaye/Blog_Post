"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle, 
  FiCheck,
  FiUser,
  FiLoader,
  FiArrowLeft
} from "react-icons/fi";
import Link from "next/link";
import { login } from '@/lib/api/api';
import { LoginCredentials } from "@/types/user";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await login(formData);

      if (response.success && response.data.user && response.data.token) {
        setIsSuccess(true);
      
        setTimeout(() => {
          router.push(redirect);
          router.refresh();
        }, 1000);
      } else {
        setErrors({ general: response.message || "Login failed. Please try again." });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message === 'Failed to login') {
        setErrors({ general: "Invalid email or password. Please try again." });
      } else {
        setErrors({ general: "Network error. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear general errors
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex items-center justify-center p-4">
      {/* Back to Posts Link - Responsive with background */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 bg-gray-900 hover:bg-gray-700/90 backdrop-blur-sm text-gray-200 hover:text-white transition-all duration-300 flex items-center rounded-xl p-3 shadow-lg border border-gray-700/50"
      >
        <FiArrowLeft className="w-5 h-5" />
        {/* Show text on larger screens */}
        <span className="hidden md:block ml-2 text-sm font-medium">Back to Posts</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-gray-800/50 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg"
            >
              <FiUser className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Access</h1>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-900/30 border-l-4 border-red-400 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <FiAlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xs sm:text-sm font-medium text-red-200">
                      Authentication failed
                    </h3>
                    <p className="text-red-100 mt-1 text-xs sm:text-sm">
                      {errors.general}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-900/30 border-l-4 border-green-400 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xs sm:text-sm font-medium text-green-200">
                      Login successful
                    </h3>
                    <p className="text-green-100 mt-1 text-xs sm:text-sm">
                      Redirecting to dashboard...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 bg-gray-800/60 border ${
                    errors.email ? "border-red-500/50" : "border-gray-700/30"
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-transparent text-sm shadow-inner transition-all duration-200 focus:bg-gray-800/80`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center"
                >
                  <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-gray-800/60 border ${
                    errors.password ? "border-red-500/50" : "border-gray-700/30"
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-transparent text-sm shadow-inner transition-all duration-200 focus:bg-gray-800/80`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center"
                >
                  <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              } text-white shadow-lg hover:shadow-purple-500/20`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Admin Notice */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
            <p className="text-xs sm:text-sm text-gray-400 text-center">
              This is an admin-only system. If you need access, please contact the system administrator.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}