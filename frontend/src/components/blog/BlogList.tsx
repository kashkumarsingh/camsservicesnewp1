'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/core/application/blog/types';
import { BlogFormatter } from '@/core/application/blog/formatters';
import { Calendar, Clock, User } from 'lucide-react';

interface BlogListProps {
  posts: BlogPost[];
  showExcerpt?: boolean;
  limit?: number;
}

const BlogList: React.FC<BlogListProps> = ({ 
  posts, 
  showExcerpt = true,
  limit 
}) => {
  const displayedPosts = limit ? posts.slice(0, limit) : posts;

  if (displayedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedPosts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          {post.featuredImage && (
            <Link href={`/blog/${post.slug}`}>
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
          )}
          
          <div className="p-6">
            {post.category && (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-3">
                {post.category}
              </span>
            )}
            
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
            </Link>
            
            {showExcerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{post.author.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{BlogFormatter.formatDate(post.publishedAt, 'short')}</span>
              </div>
              
              {post.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{BlogFormatter.formatReadingTime(post.readingTime)}</span>
                </div>
              )}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default BlogList;




