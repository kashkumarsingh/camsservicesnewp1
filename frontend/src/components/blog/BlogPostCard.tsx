'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/core/application/blog/types';
import { BlogFormatter } from '@/core/application/blog/formatters';
import { Calendar, Clock, User, Eye } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, featured = false }) => {
  return (
    <article
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`}>
          <div className={`relative w-full overflow-hidden ${featured ? 'h-64' : 'h-48'}`}>
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          {post.category && (
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
              {post.category}
            </span>
          )}
          {post.views !== undefined && post.views > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye size={14} />
              <span>{post.views}</span>
            </div>
          )}
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h2 className={`font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors ${
            featured ? 'text-2xl' : 'text-xl'
          }`}>
            {post.title}
          </h2>
        </Link>
        
        <p className={`text-gray-600 mb-4 ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}>
          {post.excerpt}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
          <div className="flex flex-wrap gap-2">
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
  );
};

export default BlogPostCard;




