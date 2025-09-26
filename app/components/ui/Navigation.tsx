import { FiSearch, FiX, FiFileText, FiArrowLeft, FiBookOpen, FiPlus, FiLogOut, } from "react-icons/fi";
import { forwardRef } from "react";
import Link from "next/link";
import { logout } from '@/lib/api/api';

interface NavigationProps {
  isSearchExpanded: boolean;
  searchQuery: string;
  postsCount: number;
  onSearchChange: (query: string) => void;
  onMobileSearchClick: () => void;
  onBackButtonClick: () => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  hasToken?: boolean;
  user: {
    email: string;
    role: string;
  } | null;
}

const Navigation = forwardRef<HTMLInputElement, NavigationProps>(
  (
    {
      isSearchExpanded,
      searchQuery,
      postsCount,
      onSearchChange,
      onMobileSearchClick,
      onBackButtonClick,
      onSearchFocus,
      onSearchBlur,
      hasToken,
    },
    ref
  ) => {

    const handleLogout = async () => {
      try {
        await logout();
        window.location.reload();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    return (
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo and branding */}
            <div className={`flex items-center ${isSearchExpanded ? "hidden md:flex" : "flex"}`}>
              <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-90 transition-opacity group relative">
                <div className="h-7 w-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 shadow-lg">
                  <FiBookOpen className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    InsightReads
                  </span>
                  <span className="text-xs text-gray-400 -mt-1 hidden sm:block">
                    Curated Knowledge Hub
                  </span>
                </div>
                {/* Tooltip for logo */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Go to homepage
                </div>
              </Link>
            </div>

            {/* Expanded mobile search */}
            {isSearchExpanded && (
              <div className="flex-1 flex md:hidden items-center">
                <button
                  onClick={onBackButtonClick}
                  className="p-1.5 rounded-md text-gray-200 hover:text-white hover:bg-gray-800 focus:outline-none mr-2 transition-colors group relative"
                >
                  <FiArrowLeft className="h-4.5 w-4.5" />
                  {/* Tooltip for back button */}
                  <div className="absolute -bottom-8 left-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Go back
                  </div>
                </button>
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    ref={ref}
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 bg-gray-800/60 border border-gray-700/40 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-transparent text-sm shadow-inner transition-all duration-150"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onBlur={onSearchBlur}
                    autoFocus
                  />
                  {searchQuery && (
                      <button
                        onClick={() => onSearchChange("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <FiX className="h-4 w-4" />
                        {/* Tooltip for clear search */}
                        <div className="absolute -bottom-8 right-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                          Clear search
                        </div>
                      </button>
                    )}
                </div>
              </div>
            )}

            {/* Standard search bar */}
            {!isSearchExpanded && (
              <div className="hidden md:flex flex-1 max-w-md mx-3">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 bg-gray-800/60 border border-gray-700/40 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-transparent text-sm shadow-inner transition-all duration-150"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={onSearchFocus}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors group"
                    >
                      <FiX className="h-4 w-4" />
                      {/* Tooltip for clear search */}
                      <div className="absolute -bottom-8 right-0 transform  bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Clear search
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Desktop actions */}
            <div className={`hidden md:flex items-center space-x-2 ${isSearchExpanded ? "lg:flex" : ""}`}>
              {/* Articles count */}
              <div className="flex items-center bg-gray-800/80 px-2.5 py-1.5 rounded-md border border-gray-700/30 text-gray-300 text-sm group relative">
                <FiFileText className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
                <span className="font-medium">{postsCount}</span>
                {/* Tooltip for articles count */}
                <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Total articles
                </div>
              </div>

              {/* Post New Button - Desktop */}
              {hasToken && (
                <Link
                  href="/admin/posts/new"
                  className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3 py-1.5 rounded-md text-white text-sm font-medium transition-all duration-150 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 group relative"
                >
                  <FiPlus className="h-3.5 w-3.5 mr-1.5" />
                  <span>New Post</span>
                </Link>
              )}

              {/* Logout Button - Desktop */}
              {hasToken && (
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md text-gray-300 text-sm font-medium transition-colors duration-150 border border-gray-700/30 group relative"
                >
                  <FiLogOut className="h-3.5 w-3.5 mr-1.5" />
                  <span>Logout</span>
                  {/* Tooltip for logout */}
                  <div className="absolute sm:hidden block -bottom-9 right-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Sign out
                  </div>
                </button>
              )}

              {/* User info - Desktop */}
              {/* {hasToken && user && (
                <div className="flex items-center space-x-2 bg-gray-800/50 px-2.5 py-1.5 rounded-md border border-gray-700/30 group relative">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <FiUser className="h-3 w-3 text-white" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs text-gray-200 font-medium">{user.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
              )} */}
            </div>

            {/* Mobile right section */}
            <div className="flex items-center md:hidden space-x-2">
              {/* Articles count - Mobile */}
              {!isSearchExpanded && (
                <div className="flex items-center bg-gray-800/80 px-2 py-1.5 rounded-md border border-gray-700/30 text-gray-300 text-sm group relative">
                  <FiFileText className="h-3.5 w-3.5 mr-1 text-purple-400" />
                  <span className="font-medium">{postsCount}</span>
                  {/* Tooltip for articles count */}
                  <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Total articles
                  </div>
                </div>
              )}

              {/* Post New Button - Mobile */}
              {hasToken && !isSearchExpanded && (
                <Link
                  href="/admin/posts/new"
                  className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md text-white transition-all duration-150 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 group relative"
                >
                  <FiPlus className="h-4 w-4" />
                  {/* Tooltip for new post */}
                  <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Create new post
                  </div>
                </Link>
              )}

              {!isSearchExpanded && (
                <button
                  onClick={onMobileSearchClick}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors duration-150 border border-gray-700/30 group relative"
                >
                  <FiSearch className="h-4 w-4" />
                  {/* Tooltip for search */}
                  <div className="absolute -bottom-9 right-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Search articles
                  </div>
                </button>
              )}

              {/* Logout Button - Mobile */}
              {hasToken && !isSearchExpanded && (
                <button
                  onClick={handleLogout}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors duration-150 border border-gray-700/30 group relative"
                >
                  <FiLogOut className="h-4 w-4" />
                  {/* Tooltip for logout */}
                  <div className="absolute -bottom-9 right-0 transform bg-black/80 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Sign out
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }
);

Navigation.displayName = "Navigation";

export default Navigation;