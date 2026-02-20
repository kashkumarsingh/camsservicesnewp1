'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { BlogPostDTO } from '@/core/application/blog';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/utils/routes';

interface BlogSidebarProps {
  currentPost: BlogPostDTO;
  relatedPosts: BlogPostDTO[];
  recentPosts: BlogPostDTO[];
  categories: Array<{ id: string; name: string; slug: string; count?: number }>;
  shareUrl: string;
}

export default function BlogSidebar({ currentPost, relatedPosts, recentPosts, categories, shareUrl }: BlogSidebarProps) {
  const shareTitle = currentPost.title;
  const shareText = currentPost.excerpt;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
  };

  return (
    <aside className="space-y-8">
      {/* Social Share */}
      <div className="bg-white p-6 rounded-card shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-navy-blue mb-4 flex items-center gap-2">
          <Share2 size={20} className="text-primary-blue" />
          Share This Article
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook size={18} />
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
            aria-label="Share on Twitter"
          >
            <Twitter size={18} />
          </a>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <a
            href={shareLinks.email}
            className="flex items-center justify-center w-10 h-10 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Share via Email"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-white p-6 rounded-card shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-navy-blue mb-4">Related Articles</h3>
          <div className="space-y-4">
            {relatedPosts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block group hover:opacity-80 transition-opacity"
              >
                <div className="flex gap-3">
                  {post.featuredImage && (
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-navy-blue group-hover:text-primary-blue transition-colors line-clamp-2 mb-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      {post.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {post.readingTime} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="bg-white p-6 rounded-card shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-navy-blue mb-4">Recent Posts</h3>
          <ul className="space-y-3">
            {recentPosts.slice(0, 5).map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block text-sm font-medium text-navy-blue hover:text-primary-blue transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
                {post.publishedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white p-6 rounded-card shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-navy-blue mb-4">Categories</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/blog?category=${category.slug}`}
                  className="flex items-center justify-between text-sm text-gray-700 hover:text-primary-blue transition-colors py-1"
                >
                  <span>{category.name}</span>
                  {category.count !== undefined && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick CTA */}
      <div className="bg-gradient-to-br from-primary-blue to-light-blue-cyan p-6 rounded-card text-white">
        <h3 className="text-lg font-bold mb-2">Need Support?</h3>
        <p className="text-sm opacity-90 mb-4">
          Get expert guidance for your child&apos;s SEN needs.
        </p>
        <Button href={ROUTES.CONTACT} variant="secondary" size="sm" className="w-full" withArrow>
          Book FREE Consultation
        </Button>
      </div>
    </aside>
  );
}

