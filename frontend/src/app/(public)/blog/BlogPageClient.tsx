'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { BlogList } from '@/interfaces/web/components/blog';
import { BlogPostDTO } from '@/core/application/blog';
import BlogCategoryFilter from './BlogCategoryFilter';

interface BlogPageClientProps {
  posts: BlogPostDTO[];
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Debug: Log posts received from server
  useEffect(() => {
    console.log('[BlogPageClient] Received posts:', posts.length, posts);
  }, [posts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(posts.map(post => post.category?.name || 'General').filter(Boolean));
    return ['all', ...Array.from(uniqueCategories)];
  }, [posts]);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    return selectedCategory === 'all' 
      ? posts 
      : posts.filter(post => post.category?.name === selectedCategory);
  }, [posts, selectedCategory]);

  // Get featured post (most recent)
  const featuredPost = posts[0];

  return (
    <div>
      <Section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Blog
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Expert insights, tips, and stories from our team supporting families and children with SEN.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button href="/contact" variant="primary" size="lg" withArrow>
              Get in touch
            </Button>
            <Button href="#featured" variant="outline" size="lg" withArrow>
              Latest articles
            </Button>
          </div>
        </div>
      </Section>

      <div className="py-6 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-center text-slate-900">
            <div>
              <p className="text-2xl font-bold">{posts.length}+</p>
              <p className="text-sm text-slate-600">Articles</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-200" />
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-slate-600">Free resources</p>
            </div>
          </div>
        </div>
      </div>

      {featuredPost && (
        <div className="py-16 bg-slate-50" id="featured">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Featured article</h2>
              <Link href={`/blog/${featuredPost.slug}`}>
                <div className="grid lg:grid-cols-2 gap-6 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-slate-200 transition-shadow">
                  {featuredPost.featuredImage && (
                    <div className="relative h-72 lg:h-auto overflow-hidden">
                      <Image
                        src={featuredPost.featuredImage}
                        alt={featuredPost.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900 text-white px-3 py-1 rounded text-xs font-semibold">
                        Featured
                      </div>
                    </div>
                  )}
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    {featuredPost.category && (
                      <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-sm font-medium mb-3 w-fit">
                        {featuredPost.category.name}
                      </span>
                    )}
                    <h3 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-3">
                      {featuredPost.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        {featuredPost.author.name}
                      </span>
                      {featuredPost.publishedAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(featuredPost.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Button variant="bordered" size="md" withArrow>
                      Read article
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      <BlogCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold text-slate-900 mb-8 text-center">
              {selectedCategory === 'all' ? 'All articles' : `${selectedCategory}`}
            </h2>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No articles found</p>
                <Button onClick={() => setSelectedCategory('all')} variant="bordered">
                  Clear filters
                </Button>
              </div>
            ) : (
              <BlogList posts={filteredPosts} />
            )}
          </div>
        </div>
      </div>

      <CTASection
        title="Ready to take action?"
        subtitle="Book a consultation to discuss how we can support your child."
        primaryCTA={{ text: "Book a consultation", href: "/contact" }}
        secondaryCTA={{ text: "View packages", href: "/packages" }}
        variant="default"
      />
    </div>
  );
}

