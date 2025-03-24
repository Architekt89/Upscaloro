'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X, User, CreditCard, LogOut, Terminal, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import Image from 'next/image';

const MenuLink = ({ href, icon, onClick, children }: { 
  href: string; 
  icon: React.ReactNode; 
  onClick: () => void; 
  children: React.ReactNode 
}) => {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={(e) => {
        // Ensure the click event is captured
        e.preventDefault();
        e.stopPropagation();
        onClick();
        // Navigate programmatically
        window.location.href = href;
      }}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

export default function Header() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Set auth loading state - use the auth context's loading state
  useEffect(() => {
    setIsAuthLoading(authLoading);
  }, [authLoading]);

  // Handle click anywhere on the page to close dropdown
  useEffect(() => {
    const handleGlobalClick = () => {
      if (profileOpen) {
        setProfileOpen(false);
      }
    };

    // Add listener to the document
    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [profileOpen]);

  // Handle scroll effect
  useEffect(() => {
    // Check scroll position immediately on mount
    const initialScrollCheck = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    
    // Run the check immediately
    initialScrollCheck();
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileOpen(!profileOpen);
  };

  // Add this function to handle link clicks
  const handleMenuItemClick = (callback?: () => void) => {
    setProfileOpen(false);
    if (callback) callback();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-none shadow-none ${
        scrolled 
          ? 'bg-gray-900/95 backdrop-blur-md' 
          : 'bg-gray-900/80 backdrop-blur-sm'
      }`}
      style={{ borderBottom: 'none', boxShadow: 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ borderBottom: 'none', boxShadow: 'none' }}>
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo - Left Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Logo 
                width={71} 
                height={71} 
                className="w-[71px] h-[71px] sm:w-[86px] sm:h-[86px] md:w-[104px] md:h-[104px]" 
              />
            </Link>
          </div>
          
          {/* Navigation Links - Center Section */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <nav className="flex space-x-6">
              <Link
                href="/"
                className="text-white/80 hover:text-white hover:underline underline-offset-8 decoration-orange-500 decoration-2 px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link
                href="/features"
                className="text-white/80 hover:text-white hover:underline underline-offset-8 decoration-orange-500 decoration-2 px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-white/80 hover:text-white hover:underline underline-offset-8 decoration-orange-500 decoration-2 px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-white/80 hover:text-white hover:underline underline-offset-8 decoration-orange-500 decoration-2 px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                Blog
              </Link>
            </nav>
          </div>
          
          {/* Profile/CTA Section - Right Section */}
          <div className="hidden md:flex items-center">
            {isAuthLoading ? (
              <div className="flex items-center space-x-2 rounded-full p-1.5">
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-700 animate-pulse rounded"></div>
                <div className="w-4 h-4 bg-gray-700 animate-pulse rounded"></div>
              </div>
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProfileMenu();
                  }}
                  className="flex items-center space-x-2 rounded-full transition-all hover:bg-gray-800 p-1.5"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  <div className="flex items-center space-x-2">
                    {user.user_metadata?.avatar_url ? (
                      <Image 
                        src={user.user_metadata.avatar_url} 
                        alt={user.email || "User profile"} 
                        width={32} 
                        height={32} 
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                    </span>
                    <ChevronDown size={16} className={`text-white transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform origin-top-right transition-all z-50 border border-gray-200 dark:border-gray-700 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <MenuLink 
                        href="/dashboard" 
                        icon={<User size={18} className="mr-3 text-gray-500 dark:text-gray-400" />}
                        onClick={() => handleMenuItemClick()}
                      >
                        Dashboard
                      </MenuLink>
                      
                      <MenuLink 
                        href="/dashboard/billing" 
                        icon={<CreditCard size={18} className="mr-3 text-gray-500 dark:text-gray-400" />}
                        onClick={() => handleMenuItemClick()}
                      >
                        Billing
                      </MenuLink>
                      
                      <MenuLink 
                        href="/dashboard/api" 
                        icon={<Terminal size={18} className="mr-3 text-gray-500 dark:text-gray-400" />}
                        onClick={() => handleMenuItemClick()}
                      >
                        API
                      </MenuLink>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuItemClick(signOut);
                        }}
                        className="flex w-full items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <LogOut size={18} className="mr-3" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white 
                  bg-gradient-to-r from-orange-500 to-orange-600 
                  hover:from-orange-400 hover:to-orange-600
                  shadow-[0_0_15px_rgba(249,115,22,0.2)]
                  hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]
                  transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {isAuthLoading ? (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse mr-2"></div>
                <div className="w-6 h-6 bg-gray-700 animate-pulse rounded ml-2"></div>
              </div>
            ) : user ? (
              <div className="relative mr-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProfileMenu();
                  }}
                  className="flex items-center p-1 rounded-full"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt={user.email || "User profile"} 
                      width={32} 
                      height={32} 
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  )}
                </button>
                
                {/* Mobile Profile Dropdown */}
                {profileOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform origin-top-right transition-all z-50 border border-gray-200 dark:border-gray-700 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <MenuLink 
                        href="/dashboard" 
                        icon={<User size={18} className="mr-3 text-gray-500 dark:text-gray-400" />}
                        onClick={() => handleMenuItemClick()}
                      >
                        Dashboard
                      </MenuLink>
                      
                      <MenuLink 
                        href="/dashboard/billing" 
                        icon={<CreditCard size={18} className="mr-3 text-gray-500 dark:text-gray-400" />}
                        onClick={() => handleMenuItemClick()}
                      >
                        Billing
                      </MenuLink>
                      
                      <MenuLink 
                        href="/dashboard/api" 
                        icon={<Terminal size={18} className="mr-3 text-gray-500 dark:text-gray-400" />}
                        onClick={() => handleMenuItemClick()}
                      >
                        API
                      </MenuLink>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuItemClick(signOut);
                        }}
                        className="flex w-full items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <LogOut size={18} className="mr-3" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-gray-900/95 backdrop-blur-md`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/features"
            className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          
          {!user && !isAuthLoading && (
            <Link
              href="/auth/login"
              className="text-white block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
          
          {isAuthLoading && (
            <div className="px-3 py-2 mt-2">
              <div className="w-full h-10 bg-gray-700 animate-pulse rounded"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 