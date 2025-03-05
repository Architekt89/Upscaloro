'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-800/50">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo - Left Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center cursor-pointer">
              <Image 
                src="/images/logo.png" 
                alt="Upscaloro Logo" 
                width={40} 
                height={40} 
                className="h-10 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-white">Upscaloro</span>
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
                href="/models"
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
                href="/api-docs"
                className="text-white/80 hover:text-white hover:underline underline-offset-8 decoration-orange-500 decoration-2 px-3 py-2 text-sm font-medium transition-all duration-200"
              >
                Blog
              </Link>
            </nav>
          </div>
          
          {/* CTA Buttons - Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white 
                  bg-gradient-to-r from-orange-500 to-orange-600 
                  hover:from-orange-400 hover:to-orange-600
                  shadow-[0_0_15px_rgba(249,115,22,0.2)]
                  hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]
                  transition-all duration-300 hover:scale-105"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-full text-white bg-transparent hover:bg-gray-800 transition-all duration-300"
                >
                  Sign Out
                </button>
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
            {user && (
              <Link
                href="/dashboard"
                className="mr-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white 
                bg-gradient-to-r from-orange-500 to-orange-600 
                hover:from-orange-400 hover:to-orange-600
                shadow-[0_0_10px_rgba(249,115,22,0.2)]
                transition-all duration-300"
              >
                Dashboard
              </Link>
            )}
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
        <div className="px-2 pt-2 pb-3 space-y-1 border-b border-gray-800/50">
          <Link
            href="/"
            className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/models"
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
            href="/api-docs"
            className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          
          {user ? (
            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-white block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 