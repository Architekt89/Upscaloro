'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// Mock data for blog posts (same as in blog/page.tsx)
const MOCK_POSTS = [
  {
    id: 1,
    title: "The Future of AI in Image Upscaling",
    excerpt: "Exploring the next generation of AI technologies that will revolutionize image enhancement.",
    category: "TECHNOLOGY",
    coverImage: "/blog/post-1.jpg",
    author: {
      name: "Alex Johnson",
      avatar: "/avatars/avatar-1.jpg",
    },
    publishedAt: new Date(2023, 8, 15).toISOString(),
    content: `
      <p>Image upscaling technology has come a long way in recent years, driven primarily by advances in artificial intelligence. This post explores where the technology is headed.</p>
      
      <h2>Current State of AI Upscaling</h2>
      <p>Today's AI upscalers use deep neural networks to analyze low-resolution images and intelligently add details that weren't present in the original. The results can be stunning, with images that maintain natural appearances while significantly increasing resolution.</p>
      
      <h2>Emerging Approaches</h2>
      <p>New research is pushing the boundaries of what's possible:</p>
      <ul>
        <li>Multi-frame super-resolution that combines information from multiple images</li>
        <li>Context-aware upscaling that understands the semantic content of images</li>
        <li>Hybrid approaches that combine traditional and AI methods</li>
      </ul>
      
      <p>These advances are making AI upscaling more accessible and powerful than ever before.</p>
    `,
  },
  {
    id: 2,
    title: "Practical Guide to Image Enhancement",
    excerpt: "Step-by-step instructions for improving your photos using modern AI tools.",
    category: "TUTORIAL",
    coverImage: "/blog/post-2.jpg",
    author: {
      name: "Maria Garcia",
      avatar: "/avatars/avatar-2.jpg",
    },
    publishedAt: new Date(2023, 9, 5).toISOString(),
    content: `
      <p>This tutorial will walk you through the process of enhancing your photos using AI-powered tools.</p>
      
      <h2>Choosing the Right Tool</h2>
      <p>There are many AI image enhancers available today. When selecting one, consider:</p>
      <ul>
        <li>Processing speed</li>
        <li>Supported file formats</li>
        <li>Special features (face enhancement, noise reduction, etc.)</li>
        <li>Cost structure (one-time purchase vs. subscription)</li>
      </ul>
      
      <h2>Basic Enhancement Workflow</h2>
      <p>Follow these steps for best results:</p>
      <ol>
        <li>Start with the highest quality original available</li>
        <li>Apply basic adjustments (exposure, contrast) before upscaling</li>
        <li>Use the AI upscaler with appropriate settings</li>
        <li>Apply finishing touches after upscaling</li>
      </ol>
      
      <p>With practice, you'll develop an eye for which images respond best to AI enhancement.</p>
    `,
  },
  {
    id: 3,
    title: "Comparing Top AI Upscaling Algorithms",
    excerpt: "An in-depth analysis of the leading AI upscaling technologies and their strengths.",
    category: "AI",
    coverImage: "/blog/post-3.jpg",
    author: {
      name: "Sam Chen",
      avatar: "/avatars/avatar-3.jpg",
    },
    publishedAt: new Date(2023, 9, 20).toISOString(),
    content: `
      <p>Not all AI upscalers are created equal. This post compares the top algorithms in the field.</p>
      
      <h2>ESRGAN vs. SRCNN</h2>
      <p>ESRGAN (Enhanced Super-Resolution Generative Adversarial Network) generally produces more photorealistic results than SRCNN (Super-Resolution Convolutional Neural Network), but at the cost of higher computational requirements.</p>
      
      <h2>Diffusion Models</h2>
      <p>The newest generation of upscalers uses diffusion models, which start with pure noise and gradually transform it into a clear image. These models excel at preserving fine details and textures.</p>
      
      <h2>Transformer-Based Approaches</h2>
      <p>Inspired by advances in natural language processing, transformer architectures are now being applied to image upscaling with impressive results, particularly for images with complex patterns.</p>
      
      <p>The best choice depends on your specific use case, with tradeoffs between quality, speed, and resource usage.</p>
    `,
  },
  // Add more posts as needed, up to 18 total
];

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  'TECHNOLOGY': 'bg-blue-100 text-blue-800',
  'AI': 'bg-purple-100 text-purple-800',
  'DESIGN': 'bg-pink-100 text-pink-800',
  'TUTORIAL': 'bg-green-100 text-green-800',
};

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<typeof MOCK_POSTS[0] | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<typeof MOCK_POSTS>([]);
  
  useEffect(() => {
    const postId = Number(params.id);
    
    // Find the post with the matching ID
    const foundPost = MOCK_POSTS.find(p => p.id === postId);
    
    if (foundPost) {
      setPost(foundPost);
      
      // Get related posts (same category, excluding current post)
      const related = MOCK_POSTS
        .filter(p => p.category === foundPost.category && p.id !== postId)
        .slice(0, 3);
      
      setRelatedPosts(related);
    } else {
      // Redirect to blog page if post not found
      router.push('/blog');
    }
  }, [params.id, router]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Link href="/blog" className="inline-flex items-center text-orange-500 hover:text-orange-400">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Blog
            </Link>
          </div>
          
          {/* Article Header */}
          <div className="max-w-3xl mx-auto">
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-800'}`}>
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            
            {/* Author and Date */}
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
          
          {/* Featured Image */}
          <div className="mt-8 max-w-4xl mx-auto relative w-full" style={{ aspectRatio: '5/4' }}>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover rounded-xl"
            />
          </div>
          
          {/* Article Content */}
          <div className="mt-12 max-w-3xl mx-auto prose prose-invert prose-orange">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
          
          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <div 
                    key={relatedPost.id} 
                    className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-[1.02] bg-gray-900/50 backdrop-blur-sm border border-gray-800/50"
                  >
                    <div className="flex-shrink-0 relative w-full" style={{ aspectRatio: '5/4' }}>
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[relatedPost.category] || 'bg-gray-100 text-gray-800'}`}>
                            {relatedPost.category}
                          </span>
                        </p>
                        <Link href={`/blog/${relatedPost.id}`} className="block mt-2 group">
                          <h3 className="text-xl font-semibold text-white group-hover:text-orange-500 transition-colors duration-200">
                            {relatedPost.title}
                          </h3>
                        </Link>
                      </div>
                      <div className="mt-6 flex items-center">
                        <div className="flex-shrink-0 relative h-8 w-8">
                          <Image
                            className="rounded-full"
                            src={relatedPost.author.avatar}
                            alt={relatedPost.author.name}
                            fill
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {relatedPost.author.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 