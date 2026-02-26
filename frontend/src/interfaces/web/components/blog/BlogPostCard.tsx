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
import { formatDate } from '@/utils/formatDate';
import { DATE_FORMAT_LONG } from '@/utils/appConstants';

interface BlogPostCardProps {
  post: BlogPostDTO;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-card border-2 border-primary-blue/20 shadow-card hover:shadow-card-hover card-hover-lift transition-all duration-300 overflow-hidden h-full flex flex-col md:hover:rotate-2">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full h-44 overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          {/* Category */}
          {post.category && (
            <div className="inline-block bg-gradient-to-r from-primary-blue/15 to-light-blue-cyan/15 text-navy-blue px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 w-fit">
              {post.category.name}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-heading font-bold text-navy-blue mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-navy-blue/80 text-sm mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Meta Information – colourful icons for kids */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-navy-blue/90 pt-4 border-t-2 border-primary-blue/10">
            {post.author && (
              <div className="flex items-center gap-1">
                <User size={14} className="text-primary-blue flex-shrink-0" />
                <span>{post.author.name}</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-star-gold flex-shrink-0" />
                <span>{formatDate(post.publishedAt, DATE_FORMAT_LONG)}</span>
              </div>
            )}
            {post.readingTime && (
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-light-blue-cyan flex-shrink-0" />
                <span>{post.readingTime} min read</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye size={14} className="text-orbital-green flex-shrink-0" />
              <span>{post.views} views</span>
            </div>
          </div>

          {/* Tags – playful pills */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-primary-blue/10 text-navy-blue px-2 py-0.5 rounded-full text-xs font-medium"
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


