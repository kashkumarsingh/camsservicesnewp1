'use client';

import { usePackages } from '@/interfaces/web/hooks/packages';
import { useBlogPosts } from '@/interfaces/web/hooks/blog';
import { useServices } from '@/interfaces/web/hooks/services';
import { useTestimonials } from '@/interfaces/web/hooks/testimonials';
import { useReviewAggregate } from '@/interfaces/web/hooks/reviews/useReviewAggregate';
import { useSiteSettings } from '@/interfaces/web/hooks/siteSettings';

export function useHomePageData(config: {
  blogLimit: number;
  testimonialsLimit: number;
}) {
  const packages = usePackages();
  const posts = useBlogPosts({ limit: config.blogLimit });
  const services = useServices({ limit: 8 });
  const testimonials = useTestimonials({
    featured: true,
    limit: config.testimonialsLimit,
  });
  const reviewAggregate = useReviewAggregate(['google', 'trustpilot']);
  const siteSettings = useSiteSettings();

  return {
    packages,
    posts,
    services,
    testimonials,
    reviewAggregate,
    siteSettings,
  };
}
