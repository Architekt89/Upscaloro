'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for blog posts
const MOCK_POSTS = Array(18).fill(null).map((_, index) => ({
  id: index + 1,
  title: `How AI is Revolutionizing Image Upscaling in ${2023 + Math.floor(index / 3)}`,
  excerpt: 'Discover how artificial intelligence is transforming the way we enhance and upscale images with unprecedented quality and detail.',
  category: ['TECHNOLOGY', 'AI', 'DESIGN', 'TUTORIAL'][index % 4],
  coverImage: `/blog/post-${(index % 6) + 1}.jpg`,
  author: {
    name: ['Alex Johnson', 'Maria Garcia', 'Sam Chen', 'Taylor Swift'][index % 4],
    avatar: `/avatars/avatar-${(index % 6) + 1}.jpg`,
  },
  publishedAt: new Date(2023, 5 + Math.floor(index / 3), 10 + (index % 20)).toISOString(),
}));

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  'TECHNOLOGY': 'bg-blue-100 text-blue-800',
  'AI': 'bg-purple-100 text-purple-800',
  'DESIGN': 'bg-pink-100 text-pink-800',
  'TUTORIAL': 'bg-green-100 text-green-800',
};

// Categories for filter
const CATEGORIES = ['ALL', 'TECHNOLOGY', 'AI', 'DESIGN', 'TUTORIAL'];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState(MOCK_POSTS);
  const postsPerPage = 9;
  
  // Filter posts based on search query and category
  useEffect(() => {
    let result = MOCK_POSTS;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'ALL') {
      result = result.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategory]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Handle page change
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="absolute inset-0">
          <div className="bg-black h-1/3 sm:h-2/3"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl">
              Our Blog
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-4">
              Latest news, tutorials, and insights about AI image upscaling and enhancement
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            <div className="col-span-2 lg:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-white"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-span-1 lg:col-span-1">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-700 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-gray-900 text-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Blog Posts Grid */}
          {currentPosts.length > 0 ? (
            <div className="mt-12 max-w-lg mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
              {currentPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-[1.02] bg-gray-900/50 backdrop-blur-sm border border-gray-800/50"
                >
                  <div className="flex-shrink-0 relative w-full" style={{ aspectRatio: '5/4' }}>
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-800'}`}>
                          {post.category}
                        </span>
                      </p>
                      <Link href={`/blog/${post.id}`} className="block mt-2 group">
                        <h3 className="text-xl font-semibold text-white group-hover:text-orange-500 transition-colors duration-200">
                          {post.title}
                        </h3>
                        <p className="mt-3 text-base text-gray-400">
                          {post.excerpt}
                        </p>
                      </Link>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0 relative h-10 w-10">
                        <Image
                          className="rounded-full"
                          src={post.author.avatar}
                          alt={post.author.name}
                          fill
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                          {post.author.name}
                        </p>
                        <div className="flex space-x-1 text-sm text-gray-400">
                          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                          <span aria-hidden="true">&middot;</span>
                          <span>5 min read</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center text-gray-300">
              <p>No posts found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Clear filters
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {filteredPosts.length > postsPerPage && (
            <div className="mt-12 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-900 text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === number
                        ? 'z-10 bg-orange-600 border-orange-500 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
                    } text-sm font-medium`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-900 text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 