/**
 * Blog Post Detail Component
 * 
 * Displays a single blog post in detail.
 */

'use client';

import { useBlogPost } from '../../hooks/blog/useBlogPost';
import Image from 'next/image';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogPostDetailProps {
  slug: string;
  incrementViews?: boolean;
}

export default function BlogPostDetail({ slug, incrementViews = true }: BlogPostDetailProps) {
  const { post, loading, error } = useBlogPost(slug, incrementViews);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Blog post not found.</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <div className="inline-block bg-primary-blue/10 text-primary-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {post.category.name}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy-blue mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-700 mb-6">{post.excerpt}</p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
          {post.author && (
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="font-semibold">{post.author.name}</span>
            </div>
          )}
          {post.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(post.publishedAt).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          )}
          {post.readingTime && (
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{post.readingTime} min read</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Eye size={18} />
            <span>{post.views} views</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative w-full h-96 mb-8 rounded-card overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-navy-blue mb-4">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-primary-blue/10 text-primary-blue px-4 py-2 rounded-full text-sm font-medium"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}


