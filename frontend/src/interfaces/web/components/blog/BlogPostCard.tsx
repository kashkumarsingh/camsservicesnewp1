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
      <article className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full h-44 overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Category */}
          {post.category && (
            <div className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-xs font-medium mb-2">
              {post.category.name}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-700">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-200">
            {post.author && (
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{post.author.name}</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
            {post.readingTime && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{post.readingTime} min read</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{post.views} views</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs"
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


