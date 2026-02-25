/**
 * Blog Post Card Component
 * 
 * Reusable card component for displaying blog post summary.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import { BlogPostDTO } from '@/core/application/blog';

interface BlogPostCardProps {
  post: BlogPostDTO;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-card border-2 border-gray-200 shadow-card hover:shadow-card-hover card-hover-lift transition-all duration-300 overflow-hidden h-full flex flex-col md:hover:rotate-3">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full h-44 overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          {/* Category */}
          {post.category && (
            <div className="inline-block bg-primary-blue/10 text-navy-blue px-2.5 py-0.5 rounded-lg text-xs font-medium mb-2">
              {post.category.name}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-navy-blue mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-4 border-t border-gray-200">
            {post.author && (
              <div className="flex items-center gap-1">
                <User size={14} className="text-primary-blue flex-shrink-0" />
                <span>{post.author.name}</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-star-gold flex-shrink-0" />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
            {post.readingTime && (
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-light-blue-cyan flex-shrink-0" />
                <span>{post.readingTime} min read</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye size={14} className="text-navy-blue flex-shrink-0" />
              <span>{post.views} views</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}


