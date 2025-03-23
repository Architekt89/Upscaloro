'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// Mock data for blog posts (same as in blog/page.tsx)
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
  content: `
    <p>Artificial intelligence has made remarkable strides in recent years, transforming various industries and applications. One area where AI has shown exceptional promise is in image upscaling and enhancement.</p>
    
    <h2>The Evolution of Image Upscaling</h2>
    <p>Traditional image upscaling methods often resulted in blurry or pixelated images when enlarging low-resolution photos. These methods typically used simple interpolation techniques that couldn't add new details to the image.</p>
    
    <p>With the advent of deep learning and neural networks, AI-powered upscaling has revolutionized this process. Modern AI upscalers can analyze the content of an image and intelligently add details that weren't present in the original, resulting in sharper, more detailed enlargements.</p>
    
    <h2>How AI Upscaling Works</h2>
    <p>AI upscaling uses deep neural networks, typically convolutional neural networks (CNNs) or generative adversarial networks (GANs), that have been trained on millions of images. These networks learn to recognize patterns and features in images and can predict what higher-resolution versions of those patterns should look like.</p>
    
    <p>When upscaling an image, the AI analyzes the low-resolution input and generates new pixels based on its training, effectively "hallucinating" details that enhance the image while maintaining its natural appearance.</p>
    
    <h2>Applications of AI Image Upscaling</h2>
    <ul>
      <li><strong>Photography:</strong> Enhancing old or low-resolution photos</li>
      <li><strong>Film and TV:</strong> Restoring and upscaling classic films to modern resolutions</li>
      <li><strong>Gaming:</strong> Improving textures and graphics in real-time</li>
      <li><strong>Medical imaging:</strong> Enhancing diagnostic images for better analysis</li>
      <li><strong>Surveillance:</strong> Clarifying details in security footage</li>
    </ul>
    
    <h2>The Future of AI Upscaling</h2>
    <p>As AI technology continues to advance, we can expect even more impressive results from image upscaling algorithms. Future developments may include:</p>
    
    <ul>
      <li>Real-time upscaling for live video streams</li>
      <li>More accurate preservation of text and fine details</li>
      <li>Better handling of artistic styles and unique visual elements</li>
      <li>Reduced computational requirements for mobile applications</li>
    </ul>
    
    <p>The field of AI image upscaling is rapidly evolving, and it's exciting to imagine what new capabilities will emerge in the coming years.</p>
  `,
}));

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