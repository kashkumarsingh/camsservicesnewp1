import type { Metadata } from 'next';
import { BlogPageClient } from '@/marketing/components/blog/BlogPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Blog - CAMS Services',
      description: 'Insights for parents, carers, schools, and professionals.',
      path: ROUTES.BLOG,
      imageAlt: 'CAMS Services Blog',
    },
    BASE_URL
  );
}

export default function BlogPage() {
  return <BlogPageClient />;
}
