'use client';

import React, { useEffect } from 'react';
import { BlogPost } from '@/core/application/blog/types';
import { BlogFormatter } from '@/core/application/blog/formatters';
import { Calendar, Clock, User, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { IncrementViewsUseCase } from '@/core/application/blog/useCases/IncrementViewsUseCase';
import { blogRepository } from '@/infrastructure/persistence/blog';

interface BlogPostProps {
  post: BlogPost;
}

const BlogPostComponent: React.FC<BlogPostProps> = ({ post }) => {
  useEffect(() => {
    // Increment view count when post is viewed using Clean Architecture use case
    const incrementUseCase = new IncrementViewsUseCase(blogRepository);
    incrementUseCase.execute(post.id).catch(console.error);
  }, [post.id]);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Blog</span>
      </Link>

      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <span className="inline-block px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">
            {post.category}
          </span>
        )}
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <User size={18} />
            <span className="font-medium">{post.author.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>{BlogFormatter.formatDate(post.publishedAt, 'long')}</span>
          </div>
          
          {post.readingTime && (
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{BlogFormatter.formatReadingTime(post.readingTime)}</span>
            </div>
          )}
          
          {post.views !== undefined && post.views > 0 && (
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span>{post.views} views</span>
            </div>
          )}
        </div>
        
        {post.featuredImage && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Author Info */}
      {post.author.bio && (
        <div className="border-t pt-6 mt-8">
          <div className="flex items-start gap-4">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {post.author.name}
              </h3>
              {post.author.bio && (
                <p className="text-gray-600 text-sm">{post.author.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogPostComponent;




