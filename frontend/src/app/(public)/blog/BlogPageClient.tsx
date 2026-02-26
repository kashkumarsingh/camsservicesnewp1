'use client';

import React, { useState, useMemo } from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { BlogList } from '@/interfaces/web/components/blog';
import { BlogPostDTO } from '@/core/application/blog';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { ROUTES } from '@/utils/routes';
import { formatDate } from '@/utils/formatDate';
import { DATE_FORMAT_LONG } from '@/utils/appConstants';
import {
  BLOG_HERO,
  BLOG_STATS,
  BLOG_FEATURED,
  BLOG_LIST,
  BLOG_CTA,
} from '@/components/blog/blogPageConstants';
import BlogCategoryFilter from './BlogCategoryFilter';

interface BlogPageClientProps {
  posts: BlogPostDTO[];
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      {/* Hero – kid-friendly gradient */}
      <Section className="border-b border-primary-blue/20 bg-gradient-to-br from-primary-blue/10 via-blue-50 to-light-blue-cyan/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-navy-blue">
            {BLOG_HERO.TITLE}
          </h1>
          <p className="mt-4 text-base md:text-lg text-navy-blue/80 max-w-2xl mx-auto">
            {BLOG_HERO.SUBTITLE}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button href={ROUTES.CONTACT} variant="primary" size="lg" withArrow>
              {BLOG_HERO.CTA_GET_IN_TOUCH}
            </Button>
            <Button href="#featured" variant="outline" size="lg" withArrow>
              {BLOG_HERO.CTA_LATEST_ARTICLES}
            </Button>
          </div>
        </div>
      </Section>

      {/* Stats strip – warm gradient */}
      <div className="py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-primary-blue/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-center text-navy-blue">
            <div>
              <p className="text-2xl font-bold text-primary-blue">{posts.length}+</p>
              <p className="text-sm font-medium text-navy-blue/80">{BLOG_STATS.ARTICLES_LABEL}</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-primary-blue/30" />
            <div>
              <p className="text-2xl font-bold text-light-blue-cyan">100%</p>
              <p className="text-sm font-medium text-navy-blue/80">{BLOG_STATS.FREE_RESOURCES_LABEL}</p>
            </div>
          </div>
        </div>
      </div>

      {featuredPost && (
        <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50" id="featured">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xl font-heading font-bold text-navy-blue mb-6">{BLOG_FEATURED.HEADING}</h2>
              <Link href={`/blog/${featuredPost.slug}`}>
                <div className="grid lg:grid-cols-2 gap-6 bg-white rounded-card overflow-hidden shadow-card border-2 border-primary-blue/20 card-hover-lift transition-all duration-300 hover:shadow-card-hover md:hover:rotate-1">
                  {featuredPost.featuredImage && (
                    <div className="relative h-72 lg:h-auto overflow-hidden">
                      <Image
                        src={featuredPost.featuredImage}
                        alt={featuredPost.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {BLOG_FEATURED.BADGE}
                      </div>
                    </div>
                  )}
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    {featuredPost.category && (
                      <span className="inline-block bg-primary-blue/10 text-navy-blue px-2.5 py-0.5 rounded-full text-sm font-medium mb-3 w-fit">
                        {featuredPost.category.name}
                      </span>
                    )}
                    <h3 className="text-2xl lg:text-3xl font-heading font-bold text-navy-blue mb-3">
                      {featuredPost.title}
                    </h3>
                    <p className="text-navy-blue/80 mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-primary-blue font-medium mb-4">
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        {featuredPost.author.name}
                      </span>
                      {featuredPost.publishedAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(featuredPost.publishedAt, DATE_FORMAT_LONG)}
                        </span>
                      )}
                    </div>
                    <Button variant="bordered" size="md" withArrow>
                      {BLOG_FEATURED.CTA}
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

      {/* Article list – soft gradient background */}
      <div className="py-16 bg-gradient-to-br from-white via-blue-50/40 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-heading font-bold text-navy-blue mb-8 text-center">
              {selectedCategory === 'all' ? BLOG_LIST.ALL_ARTICLES : selectedCategory}
            </h2>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-navy-blue/80 mb-4">{EMPTY_STATE.NO_ARTICLES_FOUND.title}</p>
                <Button onClick={() => setSelectedCategory('all')} variant="bordered">
                  {BLOG_LIST.CLEAR_FILTERS}
                </Button>
              </div>
            ) : (
              <BlogList posts={filteredPosts} />
            )}
          </div>
        </div>
      </div>

      <CTASection
        title={BLOG_CTA.TITLE}
        subtitle={BLOG_CTA.SUBTITLE}
        primaryCTA={{ text: BLOG_CTA.PRIMARY, href: ROUTES.CONTACT }}
        secondaryCTA={{ text: BLOG_CTA.SECONDARY, href: ROUTES.PACKAGES }}
        variant="default"
      />
    </div>
  );
}

